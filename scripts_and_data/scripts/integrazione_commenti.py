#!/usr/bin/env python3
"""
Funzioni per integrare commenti storici nel flusso dati
"""

import json
from pathlib import Path
from typing import Dict, List, Any, Optional

COMMENTI_FILE = Path("datasets/commenti/commenti_storici.json")


def load_commenti() -> Dict[int, List[Dict[str, str]]]:
    """Carica commenti storici da JSON"""
    if not COMMENTI_FILE.exists():
        return {}
    
    try:
        with COMMENTI_FILE.open('r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Converti chiavi stringa in int se necessario
        result = {}
        for k, v in data.items():
            try:
                result[int(k)] = v
            except (ValueError, TypeError):
                result[k] = v
        
        return result
    except Exception as e:
        print(f"[ERROR] Errore caricando commenti: {e}")
        return {}


def get_commenti_articolo(articolo_id: int) -> List[Dict[str, str]]:
    """Restituisce commenti per un articolo specifico"""
    commenti = load_commenti()
    return commenti.get(articolo_id, [])


def format_commenti_markdown(articolo_id: int) -> str:
    """Formatta commenti come Markdown per Astro"""
    commenti = get_commenti_articolo(articolo_id)
    
    if not commenti:
        return ""
    
    lines = []
    lines.append("\n<!-- Commenti Storici -->")
    lines.append('<div class="commenti-storici">')
    lines.append("  <h3>Commenti Storici</h3>")
    
    for commento in commenti:
        autore = commento.get('autore', 'Anonimo')
        data = commento.get('data', '')
        testo = commento.get('testo', '')
        
        # Formatta data (da YYYY-MM-DD HH:MM:SS a formato leggibile)
        if data:
            try:
                from datetime import datetime
                dt = datetime.strptime(data, '%Y-%m-%d %H:%M:%S')
                data_formattata = dt.strftime('%d %B %Y')
            except:
                data_formattata = data
        else:
            data_formattata = ''
        
        lines.append('  <div class="commento">')
        lines.append(f'    <p class="autore">{autore}</p>')
        if data_formattata:
            lines.append(f'    <p class="data">{data_formattata}</p>')
        lines.append(f'    <div class="testo">{testo}</div>')
        lines.append('  </div>')
    
    lines.append('</div>')
    
    return "\n".join(lines)


def get_statistiche_commenti() -> Dict[str, Any]:
    """Restituisce statistiche sui commenti"""
    commenti = load_commenti()
    
    totale_articoli = len(commenti)
    totale_commenti = sum(len(c) for c in commenti.values())
    
    return {
        'totale_articoli_con_commenti': totale_articoli,
        'totale_commenti': totale_commenti,
        'media_commenti_per_articolo': totale_commenti / totale_articoli if totale_articoli > 0 else 0
    }


if __name__ == "__main__":
    # Test
    commenti = load_commenti()
    print(f"Commenti caricati: {len(commenti)} articoli")
    
    stats = get_statistiche_commenti()
    print(f"Statistiche: {stats}")
    
    if commenti:
        # Mostra esempio
        first_id = list(commenti.keys())[0]
        print(f"\nEsempio articolo {first_id}:")
        print(format_commenti_markdown(first_id))

