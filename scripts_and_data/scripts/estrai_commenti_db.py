#!/usr/bin/env python3
"""
Estrae commenti direttamente dal database WordPress
Legge credenziali da wp-config.php o variabili d'ambiente
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional
from collections import defaultdict

# Paths
WP_CONFIG = Path("wp-config.php")
OUTPUT_FILE = Path("datasets/commenti/commenti_storici.json")


def parse_wp_config() -> Optional[Dict[str, str]]:
    """Estrae credenziali DB da wp-config.php"""
    if not WP_CONFIG.exists():
        return None
    
    config = {}
    
    try:
        with WP_CONFIG.open('r', encoding='utf-8') as f:
            content = f.read()
        
        # Estrai DB_HOST
        match = re.search(r"define\s*\(\s*['\"]DB_HOST['\"]\s*,\s*['\"]([^'\"]+)['\"]", content)
        if match:
            config['host'] = match.group(1)
        
        # Estrai DB_USER
        match = re.search(r"define\s*\(\s*['\"]DB_USER['\"]\s*,\s*['\"]([^'\"]+)['\"]", content)
        if match:
            config['user'] = match.group(1)
        
        # Estrai DB_PASSWORD
        match = re.search(r"define\s*\(\s*['\"]DB_PASSWORD['\"]\s*,\s*['\"]([^'\"]+)['\"]", content)
        if match:
            config['password'] = match.group(1)
        
        # Estrai DB_NAME
        match = re.search(r"define\s*\(\s*['\"]DB_NAME['\"]\s*,\s*['\"]([^'\"]+)['\"]", content)
        if match:
            config['database'] = match.group(1)
        
        # Estrai table_prefix
        match = re.search(r"\$table_prefix\s*=\s*['\"]([^'\"]+)['\"]", content)
        if match:
            config['prefix'] = match.group(1)
        else:
            config['prefix'] = 'wp_'
        
    except Exception as e:
        print(f"[ERROR] Errore leggendo wp-config.php: {e}")
        return None
    
    if all(k in config for k in ['host', 'user', 'password', 'database']):
        return config
    
    return None


def extract_comments_mysql(config: Dict[str, str]) -> Dict[int, List[Dict[str, str]]]:
    """Estrae commenti usando MySQL"""
    try:
        import mysql.connector
    except ImportError:
        print("[ERROR] mysql-connector-python non installato.")
        print("[INFO] Installa con: pip install mysql-connector-python")
        return {}
    
    commenti_per_articolo = defaultdict(list)
    
    try:
        # Connetti al database
        conn = mysql.connector.connect(
            host=config['host'],
            user=config['user'],
            password=config['password'],
            database=config['database'],
            charset='utf8mb4',
            collation='utf8mb4_unicode_ci'
        )
        
        cursor = conn.cursor(dictionary=True)
        
        # Query commenti
        prefix = config['prefix']
        query = f"""
        SELECT
            c.comment_post_ID AS post_id,
            c.comment_author AS autore,
            c.comment_date AS data,
            c.comment_content AS testo
        FROM {prefix}comments c
        INNER JOIN {prefix}posts p ON c.comment_post_ID = p.ID
        WHERE c.comment_approved = '1'
          AND p.post_type = 'post'
          AND p.post_status = 'publish'
        ORDER BY c.comment_post_ID ASC, c.comment_date ASC
        """
        
        cursor.execute(query)
        results = cursor.fetchall()
        
        for row in results:
            post_id = int(row['post_id'])
            commenti_per_articolo[post_id].append({
                'autore': row['autore'] or '',
                'data': str(row['data']),
                'testo': row['testo'] or ''
            })
        
        cursor.close()
        conn.close()
        
        return dict(commenti_per_articolo)
    
    except mysql.connector.Error as e:
        print(f"[ERROR] Errore database: {e}")
        return {}
    except Exception as e:
        print(f"[ERROR] Errore generico: {e}")
        return {}


def extract_comments_sqlite(config: Dict[str, str]) -> Dict[int, List[Dict[str, str]]]:
    """Estrae commenti usando SQLite (se il DB è SQLite)"""
    try:
        import sqlite3
    except ImportError:
        return {}
    
    # SQLite non comune per WordPress, ma proviamo
    db_path = Path(config.get('database', ''))
    if not db_path.exists():
        return {}
    
    commenti_per_articolo = defaultdict(list)
    
    try:
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        prefix = config.get('prefix', 'wp_')
        query = f"""
        SELECT
            c.comment_post_ID AS post_id,
            c.comment_author AS autore,
            c.comment_date AS data,
            c.comment_content AS testo
        FROM {prefix}comments c
        INNER JOIN {prefix}posts p ON c.comment_post_ID = p.ID
        WHERE c.comment_approved = '1'
          AND p.post_type = 'post'
          AND p.post_status = 'publish'
        ORDER BY c.comment_post_ID ASC, c.comment_date ASC
        """
        
        cursor.execute(query)
        results = cursor.fetchall()
        
        for row in results:
            post_id = int(row['post_id'])
            commenti_per_articolo[post_id].append({
                'autore': row['autore'] or '',
                'data': str(row['data']),
                'testo': row['testo'] or ''
            })
        
        conn.close()
        return dict(commenti_per_articolo)
    
    except Exception as e:
        print(f"[ERROR] Errore SQLite: {e}")
        return {}


def main():
    """Estrae commenti dal database"""
    print("="*60)
    print("ESTRAZIONE COMMENTI DA DATABASE WORDPRESS")
    print("="*60)
    
    # Prova a leggere wp-config.php
    config = parse_wp_config()
    
    if not config:
        print("[WARN] Impossibile leggere wp-config.php")
        print("[INFO] Alternative:")
        print("  1. Usa lo script PHP: scripts/estrai_commenti.php")
        print("  2. Esegui sul server WordPress")
        print("  3. Fornisci credenziali manualmente")
        return
    
    print(f"[OK] Credenziali DB trovate")
    print(f"  Host: {config['host']}")
    print(f"  Database: {config['database']}")
    print(f"  Prefix: {config['prefix']}")
    
    # Estrai commenti
    print("\n[INFO] Connessione al database...")
    
    # Prova MySQL prima
    commenti = extract_comments_mysql(config)
    
    if not commenti:
        # Prova SQLite
        commenti = extract_comments_sqlite(config)
    
    if not commenti:
        print("\n[WARN] Nessun commento estratto o errore connessione")
        print("[INFO] Usa lo script PHP invece: scripts/estrai_commenti.php")
        return
    
    # Salva risultato
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    with OUTPUT_FILE.open('w', encoding='utf-8') as f:
        json.dump(commenti, f, ensure_ascii=False, indent=2)
    
    # Statistiche
    totale_articoli = len(commenti)
    totale_commenti = sum(len(c) for c in commenti.values())
    
    print("\n" + "="*60)
    print("RIEPILOGO")
    print("="*60)
    print(f"[OK] Articoli con commenti: {totale_articoli}")
    print(f"[OK] Totale commenti: {totale_commenti}")
    print(f"[OK] File salvato: {OUTPUT_FILE}")
    
    # Mostra esempi
    if commenti:
        print("\n[INFO] Esempi commenti estratti:")
        for idx, (art_id, commenti_list) in enumerate(list(commenti.items())[:3], 1):
            print(f"\n  Articolo {art_id} ({len(commenti_list)} commenti):")
            for comm in commenti_list[:2]:
                autore = comm.get('autore', 'N/A')
                data = comm.get('data', 'N/A')
                testo = comm.get('testo', '')[:100]
                print(f"    - {autore} ({data}): {testo}...")


if __name__ == "__main__":
    main()

