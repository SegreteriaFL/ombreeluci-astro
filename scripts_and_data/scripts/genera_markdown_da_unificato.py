#!/usr/bin/env python3
"""
Script per generare tutti i file Markdown da database_unificato.json
"""

import json
import re
from pathlib import Path
from typing import Dict, Any
from datetime import datetime

try:
    import html2text
    HTML_CONVERTER = html2text.HTML2Text()
    HTML_CONVERTER.ignore_links = False
    HTML_CONVERTER.ignore_images = False
    HTML_CONVERTER.body_width = 0
    HTML_CONVERTER.unicode_snob = True
except ImportError:
    HTML_CONVERTER = None
    print("[WARN] html2text non installato. Installalo con: pip install html2text")

# Paths
project_root = Path(__file__).parent.parent.parent
database_file = project_root / "scripts_and_data" / "datasets" / "articoli" / "database_unificato.json"
output_dir = project_root / "src" / "content" / "blog"

def slugify(text: str) -> str:
    """Genera uno slug da un testo."""
    if not text:
        return "articolo-senza-titolo"
    
    text = text.lower()
    replacements = {
        'à': 'a', 'è': 'e', 'é': 'e', 'ì': 'i', 'ò': 'o', 'ù': 'u',
        'ç': 'c', 'ñ': 'n', ' ': '-', '_': '-',
    }
    
    for old, new in replacements.items():
        text = text.replace(old, new)
    
    text = re.sub(r'[^a-z0-9\-]', '', text)
    text = re.sub(r'-+', '-', text)
    text = text.strip('-')
    
    if not text:
        return "articolo-senza-titolo"
    
    return text

def escape_yaml_string(value: str) -> str:
    """Escape una stringa per il frontmatter YAML."""
    if not value:
        return '""'
    
    if '"' in value:
        value = value.replace('"', '\\"')
    
    if any(char in value for char in [':', '[', ']', '{', '}', '|', '>', '&', '*', '#', '?', '-', ',']):
        return f'"{value}"'
    
    if value.strip() != value:
        return f'"{value}"'
    
    if '\n' in value:
        return f'"{value}"'
    
    return f'"{value}"'

def format_date(date_str: str) -> str:
    """Formatta una data per il frontmatter YAML (YYYY-MM-DD)."""
    if not date_str:
        return ""
    
    try:
        formats = [
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%d",
            "%d/%m/%Y",
        ]
        
        for fmt in formats:
            try:
                dt = datetime.strptime(date_str, fmt)
                return dt.strftime("%Y-%m-%d")
            except ValueError:
                continue
        
        if ' ' in date_str:
            date_str = date_str.split(' ')[0]
        
        return date_str
    except Exception:
        return date_str.split(' ')[0] if ' ' in date_str else date_str

def html_to_markdown(html_content: str) -> str:
    """Converte HTML in Markdown pulito con formattazione standardizzata."""
    if not html_content or not html_content.strip():
        return ""
    
    # Rimuovi script e style
    html_content = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
    html_content = re.sub(r'<style[^>]*>.*?</style>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
    
    # Gestisci blockquote prima
    html_content = re.sub(r'<blockquote[^>]*>(.*?)</blockquote>', r'\n\n> \1\n\n', html_content, flags=re.DOTALL | re.IGNORECASE)
    
    # Converti heading
    html_content = re.sub(r'<h([1-6])[^>]*>(.*?)</h\1>', lambda m: f'\n\n{"#" * int(m.group(1))} {re.sub(r"<[^>]+>", "", m.group(2))}\n\n', html_content, flags=re.DOTALL | re.IGNORECASE)
    
    # Converti strong/b in **
    html_content = re.sub(r'<strong[^>]*>(.*?)</strong>', lambda m: f'**{m.group(1).strip()}**', html_content, flags=re.DOTALL | re.IGNORECASE)
    html_content = re.sub(r'<b[^>]*>(.*?)</b>', lambda m: f'**{m.group(1).strip()}**', html_content, flags=re.DOTALL | re.IGNORECASE)
    
    # Converti em/i in *
    html_content = re.sub(r'<em[^>]*>(.*?)</em>', r'*\1*', html_content, flags=re.DOTALL | re.IGNORECASE)
    html_content = re.sub(r'<i[^>]*>(.*?)</i>', r'*\1*', html_content, flags=re.DOTALL | re.IGNORECASE)
    
    # Converti link
    html_content = re.sub(r'<a[^>]*href=["\']([^"\']*)["\'][^>]*>(.*?)</a>', r'[\2](\1)', html_content, flags=re.DOTALL | re.IGNORECASE)
    
    # Converti liste
    html_content = re.sub(r'<ul[^>]*>', '\n\n', html_content, flags=re.IGNORECASE)
    html_content = re.sub(r'</ul>', '\n\n', html_content, flags=re.IGNORECASE)
    html_content = re.sub(r'<ol[^>]*>', '\n\n', html_content, flags=re.IGNORECASE)
    html_content = re.sub(r'</ol>', '\n\n', html_content, flags=re.IGNORECASE)
    html_content = re.sub(r'<li[^>]*>(.*?)</li>', r'- \1\n', html_content, flags=re.DOTALL | re.IGNORECASE)
    
    # Converti paragrafi: ogni <p> diventa doppio a capo
    html_content = re.sub(r'<p[^>]*>', '\n\n', html_content, flags=re.IGNORECASE)
    html_content = re.sub(r'</p>', '\n\n', html_content, flags=re.IGNORECASE)
    
    # Converti br in singolo a capo
    html_content = re.sub(r'<br\s*/?>', '\n', html_content, flags=re.IGNORECASE)
    
    # Rimuovi tutti gli altri tag HTML
    html_content = re.sub(r'<[^>]+>', '', html_content)
    
    # Decodifica entità HTML
    html_content = html_content.replace('&nbsp;', ' ')
    html_content = html_content.replace('&amp;', '&')
    html_content = html_content.replace('&lt;', '<')
    html_content = html_content.replace('&gt;', '>')
    html_content = html_content.replace('&quot;', '"')
    html_content = html_content.replace('&#39;', "'")
    html_content = html_content.replace('&apos;', "'")
    
    # Pulisci spazi multipli
    html_content = re.sub(r'[ \t]+', ' ', html_content)
    
    # Normalizza newline: massimo 2 consecutive
    html_content = re.sub(r'\n{3,}', '\n\n', html_content)
    
    # Rimuovi spazi all'inizio e fine di ogni riga
    lines = html_content.split('\n')
    cleaned_lines = []
    for line in lines:
        cleaned_line = line.strip()
        if cleaned_line:
            cleaned_lines.append(cleaned_line)
        elif cleaned_lines and cleaned_lines[-1]:
            cleaned_lines.append('')
    
    html_content = '\n'.join(cleaned_lines)
    
    # Pulisci doppi asterischi malformati
    html_content = re.sub(r'\*\*\s*$', '', html_content, flags=re.MULTILINE)
    html_content = re.sub(r'^\s*\*\*', '', html_content, flags=re.MULTILINE)
    html_content = re.sub(r'\*{3,}', '**', html_content)
    html_content = re.sub(r'([.!?;:])\s*\*\*([^\s])', r'\1 **\2', html_content)
    html_content = re.sub(r'\*\*([.!?;:])', r'\1', html_content)
    
    html_content = html_content.strip()
    
    return html_content

def main():
    """Funzione principale."""
    print("="*80)
    print("GENERAZIONE MARKDOWN DA DATABASE UNIFICATO")
    print("="*80)
    
    if not database_file.exists():
        print(f"[ERROR] File non trovato: {database_file}")
        return
    
    # Carica database unificato
    print(f"\n[INFO] Caricamento database unificato...")
    with open(database_file, 'r', encoding='utf-8') as f:
        database = json.load(f)
    
    print(f"[OK] Caricati {len(database)} articoli")
    
    # Crea directory output
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Statistiche
    success_count = 0
    error_count = 0
    clusters_created = set()
    
    print(f"\n[INFO] Generazione file Markdown...")
    
    for record in database:
        try:
            art_id = record.get('id')
            title = record.get('title', 'Articolo senza titolo')
            cluster_id = record.get('cluster_id', 0)
            
            # Genera slug
            slug = record.get('slug')
            if not slug:
                slug = slugify(title)
            
            # Nome cartella cluster
            cluster_dir = output_dir / f"cluster-{cluster_id}"
            cluster_dir.mkdir(parents=True, exist_ok=True)
            clusters_created.add(cluster_id)
            
            # File output
            md_file = cluster_dir / f"{slug}.md"
            
            # Frontmatter
            frontmatter = {
                'title': title,
                'date': format_date(record.get('date', '')),
                'author': record.get('author', ''),
                'theme': f'cluster-{cluster_id}',
                'cluster_id': cluster_id,
                'slug': slug,
                'has_comments': False,  # Verrà popolato dopo se necessario
            }
            
            # Aggiungi immagine se presente
            if record.get('copertina_url'):
                frontmatter['image'] = record.get('copertina_url')
            
            # Aggiungi PDF se presente
            if record.get('pdf_url'):
                frontmatter['pdf_url'] = record.get('pdf_url')
            
            # Aggiungi numero rivista e anno
            if record.get('numero_rivista') is not None:
                frontmatter['numero_rivista'] = record.get('numero_rivista')
            if record.get('anno_rivista') is not None:
                frontmatter['anno_rivista'] = record.get('anno_rivista')
            
            # Aggiungi copertina_url esplicitamente
            if record.get('copertina_url'):
                frontmatter['copertina_url'] = record.get('copertina_url')
            
            # Aggiungi metadati aggiuntivi
            if record.get('tema_code'):
                frontmatter['tema_code'] = record.get('tema_code')
            if record.get('tema_label'):
                frontmatter['tema_label'] = record.get('tema_label')
            if record.get('categoria_menu'):
                frontmatter['categoria_menu'] = record.get('categoria_menu')
            
            # Converti HTML a Markdown
            html_content = record.get('html_pulito', '')
            markdown_content = html_to_markdown(html_content)
            
            # Costruisci file
            frontmatter_lines = ['---']
            for key, value in frontmatter.items():
                if isinstance(value, bool):
                    frontmatter_lines.append(f"{key}: {str(value).lower()}")
                elif isinstance(value, (int, float)):
                    frontmatter_lines.append(f"{key}: {value}")
                else:
                    frontmatter_lines.append(f"{key}: {escape_yaml_string(str(value))}")
            frontmatter_lines.append('---')
            
            file_content = '\n'.join(frontmatter_lines) + '\n\n' + markdown_content
            
            # Scrivi file con encoding UTF-8 e BOM per Windows
            md_file.write_text(file_content, encoding='utf-8-sig')
            success_count += 1
            
            if success_count % 100 == 0:
                print(f"[INFO] Generati {success_count} file...")
                
        except Exception as e:
            print(f"[ERROR] Errore generando articolo {art_id}: {e}")
            error_count += 1
    
    print(f"\n[INFO] Completato!")
    print(f"  [OK] Successi: {success_count}")
    print(f"  [ERROR] Errori: {error_count}")
    print(f"  [INFO] Cluster creati: {len(clusters_created)}")
    print(f"  [INFO] Cluster: {sorted(clusters_created)}")

if __name__ == "__main__":
    main()

