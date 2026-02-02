#!/usr/bin/env python3
"""
Script di test per mostrare esempi PRIMA/DOPO la pulizia
Su articoli specifici problematici
"""

import json
import re
from pathlib import Path
from bs4 import BeautifulSoup
import html

BASE_DIR = Path(__file__).parent.parent.parent
CONTENT_DIR = BASE_DIR / "src" / "content" / "blog"

# Articoli da testare (slug -> wp_id)
TEST_ARTICLES = {
    "la-mia-esperienza-con-il-taxi-sociale-a-roma": 40648,
    "pap-dove-sei": 29117,
    "una-foto-da-hong-kong": 25743,
    "marie-la-strabica-di-georges-simenon-recensione": 24722,
    "cosa-c-oltre-la-scuola": 23723,
    "giochi-da-fare-a-casa": 16792,
}


def load_articles_jsonl() -> dict:
    """Carica articoli da JSONL"""
    articles = {}
    jsonl_file = BASE_DIR / "scripts_and_data" / "datasets" / "articoli" / "articoli_semantici_FULL_2026.jsonl"
    
    if not jsonl_file.exists():
        print(f"[ERROR] File non trovato: {jsonl_file}")
        return articles
    
    try:
        with jsonl_file.open('r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    article = json.loads(line)
                    articles[article['id']] = article
    except Exception as e:
        print(f"Errore leggendo JSONL: {e}")
    
    return articles


def remove_sommario(html_content: str) -> str:
    """Rimuove sommari iniziali"""
    content = html_content
    patterns = [
        r'<p><b>SOMMARIO\s*</b>\s*</p>',
        r'<p><strong>SOMMARIO\s*</strong>\s*</p>',
        r'<strong>SOMMARIO\s*</strong>',
        r'<b>SOMMARIO\s*</b>',
    ]
    for pattern in patterns:
        content = re.sub(pattern, '', content, flags=re.IGNORECASE | re.DOTALL)
    
    # Rimuovi tutto dopo SOMMARIO fino al primo paragrafo valido
    sommario_match = re.search(r'(?i)SOMMARIO', content)
    if sommario_match:
        start = sommario_match.start()
        # Cerca fine sommario
        end_patterns = [
            r'</h4>\s*<p>',
            r'</p>\s*<p><span class="capolettera">',
        ]
        for pattern in end_patterns:
            match = re.search(pattern, content[start:], re.IGNORECASE)
            if match:
                content = content[:start] + content[start + match.end():]
                break
        else:
            # Rimuovi fino a 2000 caratteri
            end_pos = min(start + 2000, len(content))
            content = content[:start] + content[end_pos:]
    
    return content


def remove_divi_tags(html_content: str) -> str:
    """Rimuove tag Divi Builder [et_pb_...]"""
    # Rimuovi tag et_pb_* e loro contenuto
    content = html_content
    
    # Rimuovi tag et_pb_section, et_pb_row, et_pb_column (mantieni solo il contenuto interno)
    content = re.sub(r'\[et_pb_section[^\]]*\](.*?)\[/et_pb_section\]', r'\1', content, flags=re.DOTALL)
    content = re.sub(r'\[et_pb_row[^\]]*\](.*?)\[/et_pb_row\]', r'\1', content, flags=re.DOTALL)
    content = re.sub(r'\[et_pb_column[^\]]*\](.*?)\[/et_pb_column\]', r'\1', content, flags=re.DOTALL)
    
    # Rimuovi tag et_pb_text (estrai solo il contenuto)
    content = re.sub(r'\[et_pb_text[^\]]*\](.*?)\[/et_pb_text\]', r'\1', content, flags=re.DOTALL)
    
    # Rimuovi altri tag et_pb_* vuoti
    content = re.sub(r'\[et_pb_[^\]]*\]', '', content)
    content = re.sub(r'\[/et_pb_[^\]]*\]', '', content)
    
    return content


def clean_html_with_beautifulsoup(html_content: str) -> str:
    """Pulisce HTML con BeautifulSoup"""
    if not html_content:
        return ""
    
    # Prima rimuovi tag Divi
    html_content = remove_divi_tags(html_content)
    
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
    except Exception as e:
        return html_content
    
    # Rimuovi script e style
    for tag in soup(['script', 'style']):
        tag.decompose()
    
    # Rimuovi span inutili (mantieni capolettera)
    for span in soup.find_all('span'):
        if not span.get_text(strip=True):
            span.decompose()
            continue
        style = span.get('style', '')
        if style and 'capolettera' not in span.get('class', []):
            span.unwrap()
    
    # Rimuovi div vuoti
    for div in soup.find_all('div'):
        if not div.get_text(strip=True) and not div.find_all(['img', 'iframe']):
            div.decompose()
    
    cleaned = str(soup)
    
    # Rimuovi style inline (tranne capolettera)
    cleaned = re.sub(r'\s+style="[^"]*"', '', cleaned)
    
    # Rimuovi spazi multipli
    cleaned = re.sub(r'\s+', ' ', cleaned)
    cleaned = re.sub(r'>\s+<', '><', cleaned)
    cleaned = re.sub(r'></p><p>', '</p> <p>', cleaned)
    
    return cleaned.strip()


def test_article(slug: str, wp_id: int, export_articles: dict):
    """Testa un articolo specifico"""
    print(f"\n{'='*80}")
    print(f"ARTICOLO: {slug} (ID: {wp_id})")
    print(f"{'='*80}\n")
    
    # Trova file markdown
    md_file = None
    for f in CONTENT_DIR.rglob(f"{slug}.md"):
        md_file = f
        break
    
    if not md_file:
        print(f"[ERROR] File markdown non trovato per {slug}")
        return
    
    # Leggi contenuto attuale
    current_content = md_file.read_text(encoding='utf-8')
    parts = current_content.split('---', 2)
    if len(parts) >= 3:
        current_body = parts[2].strip()
    else:
        current_body = current_content
    
    # Cerca negli export
    if wp_id not in export_articles:
        print(f"[ERROR] Articolo {wp_id} non trovato")
        return
    
    original_html = export_articles[wp_id].get('html_pulito', '')
    if not original_html:
        print(f"[ERROR] html_pulito non disponibile")
        return
    
    # Pulisci
    cleaned = original_html
    cleaned = remove_sommario(cleaned)
    cleaned = clean_html_with_beautifulsoup(cleaned)
    
    # Mostra PRIMA (primi 500 caratteri)
    print("=" * 80)
    print("PRIMA (contenuto attuale - primi 500 caratteri):")
    print("=" * 80)
    print(current_body[:500])
    if len(current_body) > 500:
        print("...")
    
    print("\n" + "=" * 80)
    print("DOPO (pulito - primi 500 caratteri):")
    print("=" * 80)
    print(cleaned[:500])
    if len(cleaned) > 500:
        print("...")
    
    # Mostra differenze specifiche
    print("\n" + "=" * 80)
    print("PROBLEMI RISOLTI:")
    print("=" * 80)
    
    issues_found = []
    # Conta tag aperti vs chiusi
    strong_open = current_body.count('<strong>')
    strong_close = current_body.count('</strong>')
    if strong_open > strong_close:
        issues_found.append(f"Tag <strong> non chiusi ({strong_open} aperti, {strong_close} chiusi)")
    
    a_open = current_body.count('<a href')
    a_close = current_body.count('</a>')
    if a_open > a_close:
        issues_found.append(f"Tag <a> non chiusi ({a_open} aperti, {a_close} chiusi)")
    
    if 'SOMMARIO' in current_body.upper():
        issues_found.append("Sommario presente")
    if '<span style="font-size:' in current_body:
        issues_found.append("Span con stili inutili")
    
    if issues_found:
        for issue in issues_found:
            print(f"  [PROBLEMA] {issue}")
    else:
        print("  Nessun problema evidente")


def main():
    print("=" * 80)
    print("TEST PULIZIA CONTENUTO - ESEMPI PRIMA/DOPO")
    print("=" * 80)
    
    # Carica articoli
    print("\nCaricamento articoli da JSONL...")
    export_articles = load_articles_jsonl()
    print(f"Caricati {len(export_articles)} articoli\n")
    
    # Testa ogni articolo
    for slug, wp_id in TEST_ARTICLES.items():
        test_article(slug, wp_id, export_articles)
    
    print("\n" + "=" * 80)
    print("TEST COMPLETATO")
    print("=" * 80)


if __name__ == "__main__":
    main()

