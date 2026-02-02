#!/usr/bin/env python3
"""
Script per popolare i file del cluster-14 con contenuto reale da articoli_semantici_FULL_2026.json
e integrare i commenti storici.
"""

import json
import re
from pathlib import Path
from typing import Dict, Any, List, Optional
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


def html_to_markdown(html_content: str) -> str:
    """Converte HTML in Markdown pulito con formattazione standardizzata."""
    if not html_content or not html_content.strip():
        return ""
    
    # Rimuovi script e style
    html_content = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
    html_content = re.sub(r'<style[^>]*>.*?</style>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
    
    # Gestisci blockquote prima (perché possono contenere altri tag)
    html_content = re.sub(r'<blockquote[^>]*>(.*?)</blockquote>', r'\n\n> \1\n\n', html_content, flags=re.DOTALL | re.IGNORECASE)
    
    # Converti heading (con doppio a capo prima e dopo)
    # Prima rimuovi eventuali tag strong/em dentro gli heading
    html_content = re.sub(r'<h([1-6])[^>]*>(.*?)</h\1>', lambda m: f'\n\n{"#" * int(m.group(1))} {re.sub(r"<[^>]+>", "", m.group(2))}\n\n', html_content, flags=re.DOTALL | re.IGNORECASE)
    
    # Converti strong/b in ** (prima di altri tag inline)
    # Gestisci anche casi con spazi o caratteri speciali
    html_content = re.sub(r'<strong[^>]*>(.*?)</strong>', lambda m: f'**{m.group(1).strip()}**', html_content, flags=re.DOTALL | re.IGNORECASE)
    html_content = re.sub(r'<b[^>]*>(.*?)</b>', lambda m: f'**{m.group(1).strip()}**', html_content, flags=re.DOTALL | re.IGNORECASE)
    
    # Converti em/i in *
    html_content = re.sub(r'<em[^>]*>(.*?)</em>', r'*\1*', html_content, flags=re.DOTALL | re.IGNORECASE)
    html_content = re.sub(r'<i[^>]*>(.*?)</i>', r'*\1*', html_content, flags=re.DOTALL | re.IGNORECASE)
    
    # Converti link
    html_content = re.sub(r'<a[^>]*href=["\']([^"\']*)["\'][^>]*>(.*?)</a>', r'[\2](\1)', html_content, flags=re.DOTALL | re.IGNORECASE)
    
    # Converti liste (ul/ol)
    html_content = re.sub(r'<ul[^>]*>', '\n\n', html_content, flags=re.IGNORECASE)
    html_content = re.sub(r'</ul>', '\n\n', html_content, flags=re.IGNORECASE)
    html_content = re.sub(r'<ol[^>]*>', '\n\n', html_content, flags=re.IGNORECASE)
    html_content = re.sub(r'</ol>', '\n\n', html_content, flags=re.IGNORECASE)
    html_content = re.sub(r'<li[^>]*>(.*?)</li>', r'- \1\n', html_content, flags=re.DOTALL | re.IGNORECASE)
    
    # Converti paragrafi: ogni <p> diventa doppio a capo, ogni </p> diventa doppio a capo
    html_content = re.sub(r'<p[^>]*>', '\n\n', html_content, flags=re.IGNORECASE)
    html_content = re.sub(r'</p>', '\n\n', html_content, flags=re.IGNORECASE)
    
    # Converti br in singolo a capo
    html_content = re.sub(r'<br\s*/?>', '\n', html_content, flags=re.IGNORECASE)
    
    # Rimuovi tutti gli altri tag HTML rimanenti
    html_content = re.sub(r'<[^>]+>', '', html_content)
    
    # Decodifica entità HTML
    html_content = html_content.replace('&nbsp;', ' ')
    html_content = html_content.replace('&amp;', '&')
    html_content = html_content.replace('&lt;', '<')
    html_content = html_content.replace('&gt;', '>')
    html_content = html_content.replace('&quot;', '"')
    html_content = html_content.replace('&#39;', "'")
    html_content = html_content.replace('&apos;', "'")
    
    # Pulisci spazi multipli (ma mantieni newline)
    html_content = re.sub(r'[ \t]+', ' ', html_content)
    
    # Normalizza newline: massimo 2 consecutive (doppio a capo)
    html_content = re.sub(r'\n{3,}', '\n\n', html_content)
    
    # Rimuovi spazi all'inizio e fine di ogni riga
    lines = html_content.split('\n')
    cleaned_lines = []
    for line in lines:
        cleaned_line = line.strip()
        if cleaned_line:  # Solo righe non vuote
            cleaned_lines.append(cleaned_line)
        elif cleaned_lines and cleaned_lines[-1]:  # Aggiungi riga vuota solo se la precedente non era vuota
            cleaned_lines.append('')
    
    html_content = '\n'.join(cleaned_lines)
    
    # Pulisci doppi asterischi malformati
    # Rimuovi ** alla fine di righe (senza testo dopo)
    html_content = re.sub(r'\*\*\s*$', '', html_content, flags=re.MULTILINE)
    # Rimuovi ** all'inizio di righe (senza testo prima)
    html_content = re.sub(r'^\s*\*\*', '', html_content, flags=re.MULTILINE)
    # Pulisci asterischi multipli consecutivi
    html_content = re.sub(r'\*{3,}', '**', html_content)
    # Aggiungi spazio prima di ** se manca dopo punteggiatura
    html_content = re.sub(r'([.!?;:])\s*\*\*([^\s])', r'\1 **\2', html_content)
    # Rimuovi ** alla fine di frasi (prima di punteggiatura finale)
    html_content = re.sub(r'\*\*([.!?;:])', r'\1', html_content)
    
    # Assicurati che ci sia sempre un doppio a capo tra blocchi di testo
    final_lines = []
    prev_line = ''
    for line in html_content.split('\n'):
        if line.strip():
            final_lines.append(line)
            prev_line = line
        else:
            final_lines.append('')
            prev_line = ''
    
    html_content = '\n'.join(final_lines)
    
    # Rimuovi newline multiple finali
    html_content = html_content.strip()
    
    return html_content


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


def format_commenti_markdown(commenti: List[Dict[str, str]]) -> str:
    """Formatta commenti come Markdown per Astro."""
    if not commenti:
        return ""
    
    lines = []
    lines.append("\n\n---\n\n## Commenti Storici\n")
    
    for commento in commenti:
        autore = commento.get('autore', 'Anonimo')
        data = commento.get('data', '')
        testo = commento.get('testo', '').strip()
        
        if not testo:
            continue
        
        # Formatta data
        if data:
            try:
                dt = datetime.strptime(data, '%Y-%m-%d %H:%M:%S')
                data_formattata = dt.strftime('%d %B %Y')
            except:
                data_formattata = data
        else:
            data_formattata = ''
        
        lines.append(f"**{autore}**")
        if data_formattata:
            lines.append(f"*{data_formattata}*")
        lines.append("")
        lines.append(testo)
        lines.append("")
        lines.append("---")
        lines.append("")
    
    return "\n".join(lines)


def parse_frontmatter(content: str) -> tuple[Dict[str, Any], str]:
    """Estrae frontmatter YAML e body da un file Markdown."""
    if not content.startswith('---'):
        return {}, content
    
    # Trova la fine del frontmatter
    parts = content.split('---', 2)
    if len(parts) < 3:
        return {}, content
    
    frontmatter_text = parts[1].strip()
    body = parts[2].strip()
    
    # Parse semplice del frontmatter YAML
    frontmatter = {}
    for line in frontmatter_text.split('\n'):
        line = line.strip()
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            
            # Converti tipi
            if value.lower() == 'true':
                value = True
            elif value.lower() == 'false':
                value = False
            elif value.isdigit():
                value = int(value)
            
            frontmatter[key] = value
    
    return frontmatter, body


def update_markdown_file(file_path: Path, articolo: Dict[str, Any], 
                         html_content: str, commenti: List[Dict[str, str]]) -> bool:
    """Aggiorna un file Markdown con nuovo contenuto."""
    try:
        # Leggi file esistente
        existing_content = file_path.read_text(encoding='utf-8')
        frontmatter, old_body = parse_frontmatter(existing_content)
        
        # Converti HTML a Markdown
        markdown_content = html_to_markdown(html_content)
        
        # Determina se ha commenti
        has_comments = len(commenti) > 0
        
        # Aggiorna frontmatter
        frontmatter['title'] = articolo.get('meta', {}).get('title', frontmatter.get('title', ''))
        frontmatter['date'] = format_date(articolo.get('meta', {}).get('date', frontmatter.get('date', '')))
        frontmatter['author'] = articolo.get('meta', {}).get('author', frontmatter.get('author', ''))
        frontmatter['theme'] = 'cluster-14'
        frontmatter['cluster_id'] = 14
        frontmatter['has_comments'] = has_comments
        
        if articolo.get('immagine'):
            frontmatter['image'] = articolo.get('immagine')
        elif 'image' in frontmatter:
            pass  # Mantieni immagine esistente
        
        if 'slug' not in frontmatter:
            frontmatter['slug'] = articolo.get('slug', '')
        
        # Costruisci nuovo contenuto
        frontmatter_lines = ['---']
        for key, value in frontmatter.items():
            if isinstance(value, bool):
                frontmatter_lines.append(f"{key}: {str(value).lower()}")
            elif isinstance(value, (int, float)):
                frontmatter_lines.append(f"{key}: {value}")
            else:
                frontmatter_lines.append(f"{key}: {escape_yaml_string(str(value))}")
        frontmatter_lines.append('---')
        
        # Aggiungi commenti se presenti
        commenti_md = format_commenti_markdown(commenti) if has_comments else ""
        
        new_content = '\n'.join(frontmatter_lines) + '\n\n' + markdown_content + commenti_md
        
        # Scrivi file
        file_path.write_text(new_content, encoding='utf-8')
        return True
        
    except Exception as e:
        print(f"[ERROR] Errore aggiornando {file_path}: {e}")
        return False


def main():
    """Funzione principale."""
    # Paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent
    articoli_file = project_root / "scripts_and_data" / "datasets" / "articoli" / "articoli_semantici_FULL_2026.json"
    unified_file = project_root / "scripts_and_data" / "datasets" / "articoli" / "unified_data.json"
    commenti_file = project_root / "scripts_and_data" / "datasets" / "commenti" / "commenti_storici.json"
    cluster14_dir = project_root / "src" / "content" / "blog" / "cluster-14"
    
    print("="*60)
    print("POPOLAMENTO CLUSTER-14")
    print("="*60)
    
    # Verifica file
    if not articoli_file.exists():
        print(f"[ERROR] File non trovato: {articoli_file}")
        return
    
    if not unified_file.exists():
        print(f"[ERROR] File non trovato: {unified_file}")
        return
    
    if not cluster14_dir.exists():
        print(f"[ERROR] Directory non trovata: {cluster14_dir}")
        return
    
    # Carica articoli completi
    print(f"\n[INFO] Caricando articoli da {articoli_file}...")
    try:
        with articoli_file.open('r', encoding='utf-8') as f:
            articoli_completi = json.load(f)
        print(f"[OK] Caricati {len(articoli_completi)} articoli")
    except Exception as e:
        print(f"[ERROR] Errore leggendo articoli: {e}")
        return
    
    # Crea mappa ID -> articolo completo
    articoli_map = {art['id']: art for art in articoli_completi}
    
    # Carica unified_data per trovare articoli cluster-14
    print(f"\n[INFO] Caricando unified_data da {unified_file}...")
    try:
        with unified_file.open('r', encoding='utf-8') as f:
            unified_data = json.load(f)
        print(f"[OK] Caricati {len(unified_data)} articoli unificati")
    except Exception as e:
        print(f"[ERROR] Errore leggendo unified_data: {e}")
        return
    
    # Carica commenti
    print(f"\n[INFO] Caricando commenti da {commenti_file}...")
    commenti_map = {}
    if commenti_file.exists():
        try:
            with commenti_file.open('r', encoding='utf-8') as f:
                commenti_data = json.load(f)
            # Converti chiavi stringa in int
            for k, v in commenti_data.items():
                try:
                    commenti_map[int(k)] = v
                except (ValueError, TypeError):
                    commenti_map[k] = v
            print(f"[OK] Caricati commenti per {len(commenti_map)} articoli")
        except Exception as e:
            print(f"[WARN] Errore leggendo commenti: {e}")
    else:
        print(f"[WARN] File commenti non trovato: {commenti_file}")
    
    # Filtra articoli cluster-14
    cluster14_articoli = []
    for art_id, art in unified_data.items():
        if art.get('nuovo_cluster_id') == 14:
            cluster14_articoli.append(art)
    
    print(f"\n[INFO] Trovati {len(cluster14_articoli)} articoli nel cluster-14")
    
    # Crea mappa slug -> file path
    print(f"\n[INFO] Scansionando file esistenti in cluster-14...")
    slug_to_file = {}
    for md_file in cluster14_dir.glob('*.md'):
        # Leggi slug dal file
        try:
            content = md_file.read_text(encoding='utf-8')
            frontmatter, _ = parse_frontmatter(content)
            slug = frontmatter.get('slug', md_file.stem)
            slug_to_file[slug] = md_file
        except Exception as e:
            print(f"[WARN] Errore leggendo {md_file}: {e}")
    
    print(f"[OK] Trovati {len(slug_to_file)} file esistenti")
    
    # Aggiorna file
    print(f"\n[INFO] Aggiornando file...")
    success_count = 0
    error_count = 0
    not_found_count = 0
    
    for art in cluster14_articoli:
        art_id = art.get('id')
        slug = art.get('slug')
        
        if not slug:
            print(f"[WARN] Articolo {art_id} senza slug, saltato")
            error_count += 1
            continue
        
        # Trova file corrispondente
        md_file = slug_to_file.get(slug)
        if not md_file:
            print(f"[WARN] File non trovato per slug '{slug}' (ID: {art_id})")
            not_found_count += 1
            continue
        
        # Ottieni contenuto HTML dall'articolo completo
        articolo_completo = articoli_map.get(art_id)
        if not articolo_completo:
            print(f"[WARN] Articolo completo non trovato per ID {art_id}")
            error_count += 1
            continue
        
        html_content = articolo_completo.get('html_pulito', '')
        if not html_content:
            print(f"[WARN] Articolo {art_id} senza contenuto HTML")
            error_count += 1
            continue
        
        # Ottieni commenti
        commenti = commenti_map.get(art_id, [])
        
        # Aggiorna file
        if update_markdown_file(md_file, art, html_content, commenti):
            success_count += 1
            if success_count % 50 == 0:
                print(f"[INFO] Aggiornati {success_count} file...")
        else:
            error_count += 1
    
    print(f"\n[INFO] Completato!")
    print(f"  [OK] Successi: {success_count}")
    print(f"  [ERROR] Errori: {error_count}")
    print(f"  [WARN] File non trovati: {not_found_count}")


if __name__ == "__main__":
    main()

