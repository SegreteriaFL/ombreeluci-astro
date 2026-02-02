#!/usr/bin/env python3
"""
Script per pulire il contenuto HTML degli articoli Markdown
- Usa BeautifulSoup per pulire e correggere HTML malformato
- Rimuove sommari iniziali
- Rimuove span inutili e stili
- Chiude tag non chiusi
- Mantiene i paragrafi originali
"""

import json
import re
from pathlib import Path
from typing import Dict, Any, Optional
from bs4 import BeautifulSoup, Tag, NavigableString
import html

BASE_DIR = Path(__file__).parent.parent.parent
CONTENT_DIR = BASE_DIR / "src" / "content" / "blog"
ARTICOLI_JSONL = BASE_DIR / "scripts_and_data" / "datasets" / "articoli" / "articoli_semantici_FULL_2026.jsonl"

# Pattern per rimuovere sommari
SOMMARIO_PATTERNS = [
    r'<p><b>SOMMARIO\s*</b>\s*</p>',
    r'<p><strong>SOMMARIO\s*</strong>\s*</p>',
    r'<strong>SOMMARIO\s*</strong>',
    r'<b>SOMMARIO\s*</b>',
    r'<h4>SOMMARIO</h4>',
    r'<h3>SOMMARIO</h3>',
]

# Pattern per rimuovere "Questo articolo è tratto da"
TRATTO_DA_PATTERNS = [
    r'<p>Questo articolo è tratto da.*?</p>',
    r'<p>Questo articolo è tratto da.*?</a>',
]

# Pattern per rimuovere newsletter footer
NEWSLETTER_PATTERNS = [
    r'<p><strong>Ogni mese inviamo una newsletter</strong>.*?</p>',
    r'<p>Iscriviti e ricevila ogni mese</p>',
]


def load_articles_jsonl() -> Dict[int, Dict[str, Any]]:
    """Carica articoli da articoli_semantici_FULL_2026.jsonl"""
    articles = {}
    
    if not ARTICOLI_JSONL.exists():
        print(f"[ERROR] File non trovato: {ARTICOLI_JSONL}")
        return articles
    
    print(f"Caricamento {ARTICOLI_JSONL.name}...")
    try:
        with ARTICOLI_JSONL.open('r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    article = json.loads(line)
                    articles[article['id']] = article
    except Exception as e:
        print(f"  [ERROR] Errore leggendo JSONL: {e}")
    
    print(f"  [OK] Caricati {len(articles)} articoli")
    return articles


def remove_sommario(html_content: str) -> str:
    """Rimuove sommari dall'HTML (iniziali e finali)"""
    content = html_content
    
    # Rimuovi pattern sommario base
    for pattern in SOMMARIO_PATTERNS:
        content = re.sub(pattern, '', content, flags=re.IGNORECASE | re.DOTALL)
    
    # Cerca tutte le occorrenze di SOMMARIO
    sommario_matches = list(re.finditer(r'(?i)SOMMARIO', content))
    
    for match in reversed(sommario_matches):  # Processa dall'ultimo al primo
        start = match.start()
        
        # Se SOMMARIO è nei primi 500 caratteri, è un sommario iniziale
        # Se è dopo, è probabilmente un sommario finale (da rimuovere completamente)
        if start > 500:
            # Sommario finale - rimuovi tutto da SOMMARIO alla fine
            content = content[:start]
            continue
        
        # Sommario iniziale - cerca la fine
        end_patterns = [
            r'</h4>\s*<p>',
            r'</p>\s*<p><span class="capolettera">',
            r'</p>\s*<p><strong>',
            r'<p><span class="capolettera">',  # Inizio articolo vero
        ]
        
        found_end = False
        for pattern in end_patterns:
            pattern_match = re.search(pattern, content[start:], re.IGNORECASE)
            if pattern_match:
                content = content[:start] + content[start + pattern_match.end():]
                found_end = True
                break
        
        if not found_end:
            # Rimuovi fino a 3000 caratteri dopo SOMMARIO o fino alla fine
            end_pos = min(start + 3000, len(content))
            content = content[:start] + content[end_pos:]
    
    return content


def remove_tratto_da(html_content: str) -> str:
    """Rimuove 'Questo articolo è tratto da'"""
    content = html_content
    for pattern in TRATTO_DA_PATTERNS:
        content = re.sub(pattern, '', content, flags=re.IGNORECASE | re.DOTALL)
    return content


def remove_newsletter_footer(html_content: str) -> str:
    """Rimuove footer newsletter"""
    content = html_content
    for pattern in NEWSLETTER_PATTERNS:
        content = re.sub(pattern, '', content, flags=re.IGNORECASE | re.DOTALL)
    return content


def convert_tag_to_markdown(element: Tag) -> str:
    """Converte un singolo tag HTML in Markdown"""
    tag_name = element.name.lower() if element.name else ''
    
    if tag_name == 'p':
        # Paragrafo: processa contenuto interno e aggiungi righe vuote
        content = process_paragraph_content(element)
        return f"\n{content}\n" if content else ""
    elif tag_name in ['strong', 'b']:
        text = process_element_content(element)
        return f"**{text}**" if text else ""
    elif tag_name in ['em', 'i']:
        text = process_element_content(element)
        return f"*{text}*" if text else ""
    elif tag_name == 'a':
        text = process_element_content(element)
        href = element.get('href', '')
        if text and href:
            return f"[{text}]({href})"
        return text if text else ""
    elif tag_name == 'blockquote':
        text = process_element_content(element)
        if text:
            lines = [f"> {line.strip()}" for line in text.split('\n') if line.strip()]
            return '\n'.join(lines) + '\n'
        return ""
    elif tag_name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
        level = int(tag_name[1])
        text = process_element_content(element)
        return f"\n{'#' * level} {text}\n" if text else ""
    elif tag_name == 'br':
        return "\n"
    elif tag_name == 'hr':
        return "\n---\n"
    elif tag_name == 'li':
        text = process_element_content(element)
        return f"- {text}" if text else ""
    elif tag_name == 'span':
        # Span: per capolettera, mantieni solo il testo senza spazi extra
        classes = element.get('class', [])
        if 'capolettera' in classes:
            # Capolettera: estrai solo il testo (es. "B" da <span class="capolettera">B</span>)
            text = element.get_text(strip=True)
            return text if text else ""
        else:
            # Altri span: processa contenuto
            return process_element_content(element)
    elif tag_name in ['div', 'ul', 'ol']:
        # Container: processa solo contenuto
        return process_element_content(element)
    else:
        # Altri tag: estrai solo testo
        return process_element_content(element)


def process_paragraph_content(element: Tag) -> str:
    """Processa il contenuto di un paragrafo, gestendo specialmente il capolettera"""
    parts = []
    prev_was_capolettera = False
    
    for child in element.children:
        if isinstance(child, NavigableString):
            text = str(child).strip()
            if text:
                # Se il precedente era capolettera, unisci senza spazio
                if prev_was_capolettera:
                    if parts:
                        parts[-1] = parts[-1] + text
                    else:
                        parts.append(text)
                    prev_was_capolettera = False
                else:
                    parts.append(text)
        elif isinstance(child, Tag):
            tag_name = child.name.lower() if child.name else ''
            
            # Gestisci capolettera specialmente
            if tag_name == 'span':
                classes = child.get('class', [])
                if 'capolettera' in classes:
                    text = child.get_text(strip=True)
                    if text:
                        # Se è il primo elemento, aggiungi senza spazio
                        if not parts:
                            parts.append(text)
                        else:
                            # Unisci con l'ultimo elemento senza spazio
                            parts[-1] = parts[-1] + text
                        prev_was_capolettera = True
                        continue
            
            # Per altri tag inline, converti normalmente
            if tag_name in ['strong', 'b', 'em', 'i', 'a']:
                converted = convert_tag_to_markdown(child)
                if converted:
                    # Se il precedente era capolettera, unisci senza spazio
                    if prev_was_capolettera and parts:
                        parts[-1] = parts[-1] + converted
                        prev_was_capolettera = False
                    else:
                        parts.append(converted)
            else:
                converted = convert_tag_to_markdown(child)
                if converted:
                    parts.append(converted)
                    prev_was_capolettera = False
    
    # Unisci le parti con spazi (ma non dopo capolettera)
    result = ' '.join(parts)
    # Rimuovi spazi multipli
    result = re.sub(r'\s+', ' ', result)
    return result


def process_element_content(element: Tag) -> str:
    """Processa il contenuto di un elemento, convertendo i tag interni in Markdown"""
    parts = []
    
    for child in element.children:
        if isinstance(child, NavigableString):
            text = str(child).strip()
            if text:
                parts.append(text)
        elif isinstance(child, Tag):
            # Per tag inline (strong, em, a, span), converti direttamente
            tag_name = child.name.lower() if child.name else ''
            if tag_name in ['strong', 'b', 'em', 'i', 'a', 'span']:
                converted = convert_tag_to_markdown(child)
                if converted:
                    parts.append(converted)
            else:
                # Per altri tag, processa ricorsivamente
                converted = convert_tag_to_markdown(child)
                if converted:
                    parts.append(converted)
    
    # Unisci le parti con spazi (per tag inline) o newline (per blocchi)
    result = ' '.join(parts)
    # Rimuovi spazi multipli
    result = re.sub(r'\s+', ' ', result)
    return result


def html_to_markdown(html_content: str) -> str:
    """Converte HTML pulito in Markdown puro"""
    if not html_content or not html_content.strip():
        return ""
    
    # Parse con BeautifulSoup
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
    except Exception as e:
        print(f"    [WARN] Errore parsing HTML: {e}")
        # Fallback: conversione semplice con regex
        return simple_html_to_markdown(html_content)
    
    # Rimuovi script e style
    for tag in soup(['script', 'style']):
        tag.decompose()
    
    # Processa il body principale
    markdown_parts = []
    
    # Se c'è un body, processalo, altrimenti processa tutto
    body = soup.find('body') or soup
    
    for element in body.children:
        if isinstance(element, NavigableString):
            text = str(element).strip()
            if text:
                markdown_parts.append(text)
        elif isinstance(element, Tag):
            converted = convert_tag_to_markdown(element)
            if converted:
                markdown_parts.append(converted)
    
    # Se non abbiamo ottenuto nulla, usa fallback
    if not markdown_parts:
        return simple_html_to_markdown(html_content)
    
    # Unisci le parti
    markdown = '\n'.join(markdown_parts)
    
    # Pulisci: rimuovi righe vuote eccessive, mantieni solo doppie righe vuote tra paragrafi
    markdown = re.sub(r'\n{3,}', '\n\n', markdown)
    # Rimuovi spazi multipli (ma mantieni spazi singoli)
    markdown = re.sub(r'[ \t]{2,}', ' ', markdown)
    
    return markdown.strip()


def simple_html_to_markdown(html_content: str) -> str:
    """Fallback: conversione semplice con regex (processa dall'interno verso l'esterno)"""
    text = html_content
    
    # Prima converti tag inline annidati (dall'interno)
    # Converti strong (può contenere altri tag)
    while re.search(r'<strong[^>]*>.*?</strong>', text, re.DOTALL):
        text = re.sub(r'<strong[^>]*>(.*?)</strong>', lambda m: f"**{clean_inline_content(m.group(1))}**", text, flags=re.DOTALL)
    while re.search(r'<b[^>]*>.*?</b>', text, re.DOTALL):
        text = re.sub(r'<b[^>]*>(.*?)</b>', lambda m: f"**{clean_inline_content(m.group(1))}**", text, flags=re.DOTALL)
    
    # Converti em
    while re.search(r'<em[^>]*>.*?</em>', text, re.DOTALL):
        text = re.sub(r'<em[^>]*>(.*?)</em>', lambda m: f"*{clean_inline_content(m.group(1))}*", text, flags=re.DOTALL)
    while re.search(r'<i[^>]*>.*?</i>', text, re.DOTALL):
        text = re.sub(r'<i[^>]*>(.*?)</i>', lambda m: f"*{clean_inline_content(m.group(1))}*", text, flags=re.DOTALL)
    
    # Converti link
    text = re.sub(r'<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>', r'[\2](\1)', text, flags=re.DOTALL)
    
    # Rimuovi span (mantieni solo contenuto)
    text = re.sub(r'<span[^>]*>(.*?)</span>', r'\1', text, flags=re.DOTALL)
    
    # Converti paragrafi (dopo aver processato il contenuto interno)
    text = re.sub(r'<p[^>]*>(.*?)</p>', r'\n\n\1\n\n', text, flags=re.DOTALL)
    
    # Rimuovi altri tag HTML residui
    text = re.sub(r'<[^>]+>', '', text)
    
    # Decodifica entità HTML
    text = html.unescape(text)
    
    # Pulisci spazi
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[ \t]{2,}', ' ', text)
    
    return text.strip()


def clean_inline_content(content: str) -> str:
    """Pulisce contenuto inline rimuovendo tag HTML residui"""
    # Rimuovi tag HTML ma mantieni testo
    cleaned = re.sub(r'<[^>]+>', '', content)
    return cleaned.strip()


def clean_html_with_beautifulsoup(html_content: str) -> str:
    """Pulisce HTML usando BeautifulSoup - chiude tag non chiusi automaticamente"""
    if not html_content or not html_content.strip():
        return ""
    
    # Parse con BeautifulSoup (usa html.parser per essere più permissivo)
    # BeautifulSoup chiude automaticamente i tag non chiusi
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
    except Exception as e:
        print(f"    [WARN] Errore parsing HTML con BeautifulSoup: {e}")
        return html_content
    
    # Rimuovi script e style
    for tag in soup(['script', 'style']):
        tag.decompose()
    
    # Rimuovi span con solo stili inutili (font-size, color, etc.)
    for span in soup.find_all('span'):
        # Rimuovi span vuoti o con solo spazi
        if not span.get_text(strip=True):
            span.decompose()
            continue
        
        # Rimuovi span con stili inutili (mantieni capolettera)
        style = span.get('style', '')
        classes = span.get('class', [])
        
        if style and 'capolettera' not in classes:
            # Rimuovi attributo style e unwrap se non ha classi importanti
            del span['style']
            if not classes:
                span.unwrap()
        elif style and 'capolettera' in classes:
            # Mantieni capolettera ma rimuovi style
            del span['style']
    
    # Rimuovi div vuoti (mantieni quelli con contenuto significativo)
    for div in soup.find_all('div'):
        text = div.get_text(strip=True)
        has_content = text or div.find_all(['img', 'iframe', 'p', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol'])
        if not has_content:
            div.decompose()
    
    # Converti in stringa - BeautifulSoup ha già chiuso tutti i tag
    cleaned = str(soup)
    
    # Post-processing: rimuovi attributi style inutili (già fatto sopra, ma per sicurezza)
    # Mantieni class="capolettera"
    cleaned = re.sub(r'<span\s+class="capolettera">', '<span class="capolettera">', cleaned)
    
    # Rimuovi altri style inline residui (tranne quelli già gestiti)
    # Non rimuovere style se è in span con capolettera (già gestito sopra)
    
    # Normalizza spazi
    cleaned = re.sub(r'\s+', ' ', cleaned)
    
    # Ripristina spazi tra paragrafi per leggibilità
    cleaned = re.sub(r'></p><p>', '</p> <p>', cleaned)
    cleaned = re.sub(r'></p>\s*<div', '</p> <div', cleaned)
    cleaned = re.sub(r'></div>\s*<p>', '</div> <p>', cleaned)
    
    return cleaned.strip()


def clean_article_content(markdown_file: Path, export_articles: Dict[int, Dict[str, Any]]) -> tuple[str, str]:
    """Pulisce il contenuto di un articolo Markdown"""
    
    # Leggi il file markdown
    try:
        content = markdown_file.read_text(encoding='utf-8')
    except Exception as e:
        return None, f"Errore lettura file: {e}"
    
    # Estrai frontmatter e body
    if not content.startswith('---'):
        return None, "File non ha frontmatter valido"
    
    parts = content.split('---', 2)
    if len(parts) < 3:
        return None, "File non ha body valido"
    
    frontmatter = parts[1]
    body = parts[2].strip()
    
    # Estrai wp_id dal frontmatter
    wp_id_match = re.search(r'wp_id:\s*(\d+)', frontmatter)
    if not wp_id_match:
        return None, "wp_id non trovato nel frontmatter"
    
    wp_id = int(wp_id_match.group(1))
    
    # Cerca l'articolo negli export
    if wp_id not in export_articles:
        return None, f"Articolo {wp_id} non trovato negli export"
    
    export_article = export_articles[wp_id]
    original_html = export_article.get('html_pulito', '')
    
    if not original_html:
        return None, "html_pulito non disponibile"
    
    # Pulisci l'HTML originale
    cleaned_html = original_html
    
    # 1. Rimuovi sommari (prima della pulizia BeautifulSoup)
    cleaned_html = remove_sommario(cleaned_html)
    
    # 2. Rimuovi "Questo articolo è tratto da"
    cleaned_html = remove_tratto_da(cleaned_html)
    
    # 3. Rimuovi newsletter footer
    cleaned_html = remove_newsletter_footer(cleaned_html)
    
    # 4. Pulisci con BeautifulSoup (chiude tag non chiusi automaticamente)
    cleaned_html = clean_html_with_beautifulsoup(cleaned_html)
    
    # 5. Rimuovi ancora sommari residui (dopo pulizia BeautifulSoup)
    cleaned_html = remove_sommario(cleaned_html)
    
    # 6. Rimuovi ancora newsletter footer residui
    cleaned_html = remove_newsletter_footer(cleaned_html)
    
    # 7. Converti HTML a Markdown puro
    markdown_content = html_to_markdown(cleaned_html)
    
    # Costruisci nuovo contenuto
    new_content = f"---{frontmatter}---\n\n{markdown_content}"
    
    return new_content, None


def main():
    print("=" * 60)
    print("PULIZIA CONTENUTO ARTICOLI MARKDOWN v2")
    print("=" * 60)
    
    # Carica articoli da JSONL
    export_articles = load_articles_jsonl()
    
    if not export_articles:
        print("[ERROR] Nessun articolo caricato dal JSONL!")
        return
    
    # Trova tutti i file markdown
    markdown_files = list(CONTENT_DIR.rglob("*.md"))
    print(f"\nTrovati {len(markdown_files)} file markdown")
    
    # Statistiche
    stats = {
        'total': 0,
        'cleaned': 0,
        'not_found': 0,
        'errors': 0,
        'skipped': 0,
        'empty_files': 0,
        'files_with_content': 0,
    }
    
    # Processa ogni file
    print(f"\nPulizia contenuti...\n")
    
    for md_file in markdown_files:
        stats['total'] += 1
        
        if stats['total'] % 100 == 0:
            print(f"  Processati {stats['total']} file... (puliti: {stats['cleaned']}, errori: {stats['errors']})")
        
        new_content, error = clean_article_content(md_file, export_articles)
        
        if error:
            if "non trovato" in error.lower() or "non disponibile" in error.lower():
                stats['not_found'] += 1
            else:
                stats['errors'] += 1
                if stats['errors'] <= 5:  # Mostra solo i primi 5 errori
                    print(f"  [ERROR] {md_file.name}: {error}")
            continue
        
        if new_content:
            try:
                # Estrai il body (dopo frontmatter) per verificare se è vuoto
                parts = new_content.split('---', 2)
                if len(parts) >= 3:
                    body = parts[2].strip()
                    # Considera vuoto se meno di 20 caratteri (per evitare falsi positivi)
                    if not body or len(body) < 20:
                        stats['empty_files'] += 1
                        if stats['empty_files'] <= 3:  # Mostra solo i primi 3
                            print(f"  [WARN] File vuoto dopo pulizia: {md_file.name} (lunghezza: {len(body)})")
                    else:
                        stats['files_with_content'] += 1
                
                md_file.write_text(new_content, encoding='utf-8')
                stats['cleaned'] += 1
            except Exception as e:
                stats['errors'] += 1
                print(f"  [ERROR] Errore scrivendo {md_file.name}: {e}")
    
    # Report finale
    print("\n" + "=" * 60)
    print("REPORT FINALE")
    print("=" * 60)
    print(f"Totale file processati: {stats['total']}")
    print(f"File puliti: {stats['cleaned']}")
    print(f"File con contenuto: {stats['files_with_content']}")
    print(f"File vuoti dopo pulizia: {stats['empty_files']}")
    print(f"Articoli non trovati: {stats['not_found']}")
    print(f"Errori: {stats['errors']}")
    
    # Genera migration_report_finale.json
    report = {
        'migration_date': str(Path(__file__).stat().st_mtime),
        'total_files_processed': stats['total'],
        'files_cleaned': stats['cleaned'],
        'files_with_content': stats['files_with_content'],
        'empty_files': stats['empty_files'],
        'not_found': stats['not_found'],
        'errors': stats['errors'],
        'all_files_have_content': stats['empty_files'] == 0,
        'coverage': {
            'cleaned_coverage': f"{stats['cleaned']/stats['total']*100:.1f}%" if stats['total'] > 0 else "0%",
            'content_coverage': f"{stats['files_with_content']/stats['total']*100:.1f}%" if stats['total'] > 0 else "0%",
        }
    }
    
    report_file = BASE_DIR / "migration_report_finale.json"
    try:
        import json as json_module
        with report_file.open('w', encoding='utf-8') as f:
            json_module.dump(report, f, ensure_ascii=False, indent=2)
        print(f"\n[OK] Report salvato: {report_file}")
    except Exception as e:
        print(f"\n[ERROR] Errore salvando report: {e}")
    
    print(f"\n[OK] Pulizia completata!")
    
    if stats['empty_files'] > 0:
        print(f"\n[WARN] ATTENZIONE: {stats['empty_files']} file sono rimasti vuoti dopo la pulizia!")
    else:
        print(f"\n[OK] Tutti i file hanno contenuto!")


if __name__ == "__main__":
    main()

