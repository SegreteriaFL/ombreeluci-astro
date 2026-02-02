#!/usr/bin/env python3
"""
Script per generare file Markdown per Astro da unified_data.json

Legge datasets/articoli/unified_data.json e crea file .md in src/content/blog/[NOME_TEMA]/
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, Any
from datetime import datetime

try:
    import html2text
    HTML_CONVERTER = html2text.HTML2Text()
    HTML_CONVERTER.ignore_links = False
    HTML_CONVERTER.ignore_images = False
    HTML_CONVERTER.body_width = 0  # Non wrappare le righe
    HTML_CONVERTER.unicode_snob = True  # Mantieni caratteri unicode
except ImportError:
    HTML_CONVERTER = None
    print("[WARN] html2text non installato. Installalo con: pip install html2text")


def slugify(text: str) -> str:
    """Genera uno slug da un testo, gestendo caratteri speciali italiani."""
    if not text:
        return "articolo-senza-titolo"
    
    # Converti in minuscolo
    text = text.lower()
    
    # Sostituisci caratteri speciali italiani
    replacements = {
        'à': 'a', 'è': 'e', 'é': 'e', 'ì': 'i', 'ò': 'o', 'ù': 'u',
        'ç': 'c', 'ñ': 'n',
        ' ': '-', '_': '-',
    }
    
    for old, new in replacements.items():
        text = text.replace(old, new)
    
    # Rimuovi caratteri non alfanumerici e trattini
    text = re.sub(r'[^a-z0-9\-]', '', text)
    
    # Rimuovi trattini multipli
    text = re.sub(r'-+', '-', text)
    
    # Rimuovi trattini iniziali e finali
    text = text.strip('-')
    
    # Se è vuoto, usa un fallback
    if not text:
        return "articolo-senza-titolo"
    
    return text


def escape_yaml_string(value: str) -> str:
    """Escape una stringa per il frontmatter YAML."""
    if not value:
        return '""'
    
    # Se contiene virgolette doppie, escape
    if '"' in value:
        value = value.replace('"', '\\"')
    
    # Se contiene caratteri speciali YAML, avvolgi in virgolette
    if any(char in value for char in [':', '[', ']', '{', '}', '|', '>', '&', '*', '#', '?', '-', ',']):
        return f'"{value}"'
    
    # Se inizia o finisce con spazi, avvolgi in virgolette
    if value.strip() != value:
        return f'"{value}"'
    
    # Se contiene newline, avvolgi in virgolette
    if '\n' in value:
        return f'"{value}"'
    
    return f'"{value}"'


def format_date(date_str: str) -> str:
    """Formatta una data per il frontmatter YAML (YYYY-MM-DD)."""
    if not date_str:
        return ""
    
    try:
        # Prova a parsare diversi formati
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
        
        # Se nessun formato funziona, prova a estrarre solo la data
        if ' ' in date_str:
            date_str = date_str.split(' ')[0]
        
        return date_str
    except Exception:
        return date_str.split(' ')[0] if ' ' in date_str else date_str


def get_theme_folder_name(cluster_id: int) -> str:
    """Genera il nome della cartella tema basato sul cluster_id."""
    return f"cluster-{cluster_id}"


def html_to_markdown(html_content: str) -> str:
    """Converte HTML in Markdown pulito."""
    if not html_content or not html_content.strip():
        return ""
    
    # Se html2text è disponibile, usalo
    if HTML_CONVERTER:
        try:
            markdown = HTML_CONVERTER.handle(html_content)
            # Pulisci spazi multipli e newline eccessive
            markdown = re.sub(r'\n{3,}', '\n\n', markdown)
            markdown = markdown.strip()
            return markdown
        except Exception as e:
            print(f"[WARN] Errore conversione HTML: {e}")
            return html_content
    
    # Fallback: conversione base manuale
    # Rimuovi script e style
    html_content = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
    html_content = re.sub(r'<style[^>]*>.*?</style>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
    
    # Converti tag comuni
    html_content = re.sub(r'<p[^>]*>', '\n\n', html_content, flags=re.IGNORECASE)
    html_content = re.sub(r'</p>', '\n', html_content, flags=re.IGNORECASE)
    html_content = re.sub(r'<br\s*/?>', '\n', html_content, flags=re.IGNORECASE)
    html_content = re.sub(r'<strong[^>]*>(.*?)</strong>', r'**\1**', html_content, flags=re.DOTALL | re.IGNORECASE)
    html_content = re.sub(r'<b[^>]*>(.*?)</b>', r'**\1**', html_content, flags=re.DOTALL | re.IGNORECASE)
    html_content = re.sub(r'<em[^>]*>(.*?)</em>', r'*\1*', html_content, flags=re.DOTALL | re.IGNORECASE)
    html_content = re.sub(r'<i[^>]*>(.*?)</i>', r'*\1*', html_content, flags=re.DOTALL | re.IGNORECASE)
    html_content = re.sub(r'<h([1-6])[^>]*>(.*?)</h\1>', r'\n\n#\1 \2\n\n', html_content, flags=re.DOTALL | re.IGNORECASE)
    html_content = re.sub(r'<a[^>]*href=["\']([^"\']*)["\'][^>]*>(.*?)</a>', r'[\2](\1)', html_content, flags=re.DOTALL | re.IGNORECASE)
    
    # Rimuovi tutti gli altri tag HTML
    html_content = re.sub(r'<[^>]+>', '', html_content)
    
    # Decodifica entità HTML comuni
    html_content = html_content.replace('&nbsp;', ' ')
    html_content = html_content.replace('&amp;', '&')
    html_content = html_content.replace('&lt;', '<')
    html_content = html_content.replace('&gt;', '>')
    html_content = html_content.replace('&quot;', '"')
    html_content = html_content.replace('&#39;', "'")
    
    # Pulisci spazi multipli e newline
    html_content = re.sub(r'\n{3,}', '\n\n', html_content)
    html_content = re.sub(r' +', ' ', html_content)
    html_content = html_content.strip()
    
    return html_content


def generate_markdown(articolo: Dict[str, Any], output_dir: Path, original_article: Dict[str, Any] = None) -> None:
    """Genera un file Markdown per un articolo."""
    
    # Estrai dati
    article_id = articolo.get('id', '')
    title = articolo.get('title', articolo.get('meta', {}).get('title', 'Articolo senza titolo'))
    date_str = articolo.get('date', articolo.get('meta', {}).get('date', ''))
    author = articolo.get('meta', {}).get('author', articolo.get('autore', {}).get('nome_completo', 'Autore sconosciuto'))
    cluster_id = articolo.get('nuovo_cluster_id', 0)
    image = articolo.get('immagine', '')
    
    # Prova a prendere il contenuto da diversi campi possibili
    # Prima dal file originale (html_pulito), poi dal unified_data
    html_content = ''
    if original_article:
        html_content = original_article.get('html_pulito', '') or original_article.get('content', '')
    
    if not html_content:
        html_content = articolo.get('html_pulito', '') or articolo.get('content', '') or articolo.get('meta', {}).get('content', '')
    
    commenti = articolo.get('commenti', [])
    
    # Genera o usa slug esistente
    slug = articolo.get('slug', '')
    if not slug:
        slug = slugify(title)
    
    # Nome tema (cartella)
    theme_name = get_theme_folder_name(cluster_id)
    
    # Crea directory tema se non esiste
    theme_dir = output_dir / theme_name
    theme_dir.mkdir(parents=True, exist_ok=True)
    
    # Formatta data
    formatted_date = format_date(date_str)
    
    # Determina se ha commenti
    has_comments = len(commenti) > 0 if isinstance(commenti, list) else False
    
    # Costruisci frontmatter YAML
    frontmatter_lines = [
        "---",
        f"title: {escape_yaml_string(title)}",
        f"date: {escape_yaml_string(formatted_date)}",
        f"author: {escape_yaml_string(author)}",
        f"theme: {escape_yaml_string(theme_name)}",
        f"cluster_id: {cluster_id}",
    ]
    
    if image:
        frontmatter_lines.append(f"image: {escape_yaml_string(image)}")
    
    frontmatter_lines.append(f"slug: {escape_yaml_string(slug)}")
    frontmatter_lines.append(f"has_comments: {str(has_comments).lower()}")
    frontmatter_lines.append("---")
    
    # Costruisci contenuto Markdown
    markdown_content = "\n".join(frontmatter_lines) + "\n\n"
    
    # Converti HTML in Markdown se presente
    if html_content and html_content.strip():
        markdown_body = html_to_markdown(html_content)
        if markdown_body:
            markdown_content += markdown_body + "\n"
        else:
            markdown_content += "<!-- Contenuto da aggiungere -->\n"
    else:
        markdown_content += "<!-- Contenuto da aggiungere -->\n"
    
    # Scrivi file
    output_file = theme_dir / f"{slug}.md"
    
    try:
        output_file.write_text(markdown_content, encoding='utf-8')
        return True
    except Exception as e:
        print(f"Errore scrivendo {output_file}: {e}")
        return False


def main():
    """Funzione principale."""
    
    # Paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent  # scripts_and_data/scripts -> scripts_and_data -> root
    input_file = project_root / "scripts_and_data" / "datasets" / "articoli" / "unified_data.json"
    original_file = project_root / "scripts_and_data" / "datasets" / "articoli" / "articoli_semantici_FULL_2026.json"
    output_dir = project_root / "src" / "content" / "blog"
    
    # Verifica file input
    if not input_file.exists():
        print(f"[ERR] File non trovato: {input_file}")
        return
    
    print(f"[INFO] Leggendo {input_file}...")
    
    # Leggi JSON unificato
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"[ERR] Errore leggendo JSON: {e}")
        return
    
    # Carica anche il file originale per ottenere html_pulito
    original_data = {}
    if original_file.exists():
        print(f"[INFO] Caricando contenuti HTML da {original_file}...")
        try:
            with open(original_file, 'r', encoding='utf-8') as f:
                original_list = json.load(f)
                for art in original_list:
                    original_data[art['id']] = art
            print(f"[OK] Caricati {len(original_data)} articoli con contenuto HTML")
        except Exception as e:
            print(f"[WARN] Errore leggendo file originale: {e}")
    else:
        print(f"[WARN] File originale non trovato: {original_file}")
    
    # Crea directory output
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"[INFO] Directory output: {output_dir}")
    print(f"[INFO] Totale articoli: {len(data)}")
    print("\n[INFO] Generazione file Markdown...\n")
    
    # Statistiche
    success_count = 0
    error_count = 0
    themes_created = set()
    
    # Processa ogni articolo
    # Se vuoi processare solo cluster-14, filtra qui
    target_cluster = 14  # None = tutti, oppure 14 per solo cluster-14
    
    for article_id, articolo in data.items():
        try:
            cluster_id = articolo.get('nuovo_cluster_id', 0)
            
            # Filtra per cluster se specificato
            if target_cluster is not None and cluster_id != target_cluster:
                continue
            
            # Ottieni articolo originale per html_pulito
            original_art = original_data.get(int(article_id)) if original_data else None
            
            if generate_markdown(articolo, output_dir, original_art):
                success_count += 1
                themes_created.add(cluster_id)
                
                # Progress ogni 100 articoli
                if success_count % 100 == 0:
                    print(f"  [OK] Processati {success_count} articoli...")
            else:
                error_count += 1
        except Exception as e:
            error_count += 1
            print(f"  [ERR] Errore processando articolo {article_id}: {e}")
    
    # Report finale
    print("\n" + "="*60)
    print("[SUCCESS] GENERAZIONE COMPLETATA")
    print("="*60)
    print(f"[OK] File generati con successo: {success_count}")
    print(f"[ERR] Errori: {error_count}")
    print(f"[INFO] Temi (cartelle) creati: {len(themes_created)}")
    print(f"\n[INFO] File salvati in: {output_dir}")
    
    # Mostra esempio di file generato
    if success_count > 0:
        print("\n" + "="*60)
        print("[EXAMPLE] ESEMPIO DI FILE GENERATO")
        print("="*60)
        
        # Trova il primo file generato
        for theme_folder in sorted(output_dir.iterdir()):
            if theme_folder.is_dir():
                md_files = list(theme_folder.glob("*.md"))
                if md_files:
                    example_file = md_files[0]
                    print(f"\nFile: {example_file.relative_to(project_root)}")
                    print("-" * 60)
                    content = example_file.read_text(encoding='utf-8')
                    # Mostra prime 30 righe
                    lines = content.split('\n')[:30]
                    print('\n'.join(lines))
                    if len(content.split('\n')) > 30:
                        print("\n... (troncato)")
                    break


if __name__ == "__main__":
    main()

