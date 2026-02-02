#!/usr/bin/env python3
"""
Crea unified_data.json unificando tutti i dati per ogni articolo
"""

import json
import csv
from pathlib import Path
from typing import Dict, Any, List, Optional

# Paths
INPUT_ARTICOLI = Path("datasets/articoli/articoli_semantici_FULL_2026.json")
INPUT_CLUSTER = Path("datasets/articoli/mappa_temi_definitiva.csv")
INPUT_SLUGS = Path("datasets/articoli/articoli_slugs_definitivi.json")
INPUT_IMMAGINI = Path("datasets/articoli/mappa_immagini_v1.json")
INPUT_COMMENTI = Path("datasets/commenti/commenti_storici.json")
INPUT_AUTORI = Path("datasets/autori/database_autori.json")
OUTPUT_UNIFIED = Path("datasets/articoli/unified_data.json")


def load_articoli() -> Dict[int, Dict[str, Any]]:
    """Carica articoli con testo e metadati base"""
    print("Caricamento articoli...")
    with INPUT_ARTICOLI.open('r', encoding='utf-8') as f:
        articoli_list = json.load(f)
    
    articoli = {}
    for art in articoli_list:
        articoli[art['id']] = art
    
    print(f"[OK] Caricati {len(articoli)} articoli")
    return articoli


def load_cluster_data() -> Dict[int, Dict[str, Any]]:
    """Carica cluster_id e score_coerenza dal CSV"""
    print("Caricamento dati cluster...")
    cluster_data = {}
    
    with INPUT_CLUSTER.open('r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            art_id = int(row['id_articolo'])
            cluster_data[art_id] = {
                'nuovo_cluster_id': int(row['nuovo_cluster_id']),
                'score_coerenza': float(row['score_coerenza'])
            }
    
    print(f"[OK] Caricati dati cluster per {len(cluster_data)} articoli")
    return cluster_data


def load_slugs() -> Dict[int, str]:
    """Carica slug articoli"""
    print("Caricamento slug...")
    with INPUT_SLUGS.open('r', encoding='utf-8') as f:
        slugs = json.load(f)
    
    # Converti chiavi stringa a int
    slugs_int = {int(k): v for k, v in slugs.items()}
    print(f"[OK] Caricati {len(slugs_int)} slug")
    return slugs_int


def load_immagini() -> Dict[int, str]:
    """Carica immagini"""
    print("Caricamento immagini...")
    with INPUT_IMMAGINI.open('r', encoding='utf-8') as f:
        immagini = json.load(f)
    
    # Converti chiavi stringa a int
    immagini_int = {int(k): v for k, v in immagini.items()}
    print(f"[OK] Caricate {len(immagini_int)} immagini")
    return immagini_int


def load_commenti() -> Dict[int, List[Dict[str, str]]]:
    """Carica commenti storici"""
    print("Caricamento commenti...")
    
    if not INPUT_COMMENTI.exists():
        print("[WARN] File commenti non trovato, uso array vuoto")
        return {}
    
    try:
        with INPUT_COMMENTI.open('r', encoding='utf-8') as f:
            content = f.read().strip()
            if not content:
                print("[WARN] File commenti vuoto, uso array vuoto")
                return {}
            commenti = json.loads(content)
    except (json.JSONDecodeError, ValueError) as e:
        print(f"[WARN] Errore lettura commenti: {e}, uso array vuoto")
        return {}
    
    if not isinstance(commenti, dict):
        print("[WARN] Formato commenti non valido, uso array vuoto")
        return {}
    
    # Converti chiavi stringa a int e mantieni solo autore, data, testo
    commenti_int = {}
    for k, v in commenti.items():
        try:
            art_id = int(k)
            commenti_puliti = []
            if isinstance(v, list):
                for comm in v:
                    if isinstance(comm, dict):
                        commenti_puliti.append({
                            'autore': comm.get('autore', ''),
                            'data': comm.get('data', ''),
                            'testo': comm.get('testo', '')
                        })
            if commenti_puliti:
                commenti_int[art_id] = commenti_puliti
        except (ValueError, TypeError):
            continue
    
    print(f"[OK] Caricati commenti per {len(commenti_int)} articoli")
    return commenti_int


def load_autori() -> Dict[str, Dict[str, Any]]:
    """Carica database autori e crea mappa per slug"""
    print("Caricamento autori...")
    
    with INPUT_AUTORI.open('r', encoding='utf-8') as f:
        autori_list = json.load(f)
    
    # Crea mappa slug -> dati autore
    autori_map = {}
    for autore in autori_list:
        slug = autore.get('slug', '')
        if slug:
            autori_map[slug] = {
                'slug': slug,
                'nome_completo': autore.get('nome_completo', ''),
                'nome_normalizzato': autore.get('nome_normalizzato', '')
            }
    
    print(f"[OK] Caricati {len(autori_map)} autori")
    return autori_map


def normalize_autore_name(autore_name: str) -> str:
    """Normalizza nome autore per creare slug"""
    if not autore_name:
        return 'redazione'
    
    # Rimuovi spazi extra e converti in lowercase
    nome = autore_name.strip().lower()
    
    # Sostituzioni comuni
    nome = nome.replace(' ', '-')
    nome = nome.replace("'", '-')
    nome = nome.replace('à', 'a').replace('è', 'e').replace('é', 'e')
    nome = nome.replace('ì', 'i').replace('ò', 'o').replace('ù', 'u')
    
    return nome


def unify_data(articoli: Dict[int, Dict[str, Any]], 
               cluster_data: Dict[int, Dict[str, Any]],
               slugs: Dict[int, str],
               immagini: Dict[int, str],
               commenti: Dict[int, List[Dict[str, str]]],
               autori_map: Dict[str, Dict[str, Any]]) -> Dict[int, Dict[str, Any]]:
    """Unifica tutti i dati per ogni articolo"""
    print("\nUnificazione dati...")
    
    unified = {}
    stats = {
        'total': 0,
        'with_comments': 0,
        'with_image': 0,
        'with_slug': 0,
        'with_autore_data': 0,
        'missing': []
    }
    
    for art_id, art in articoli.items():
        stats['total'] += 1
        
        # Base: testo e metadati
        unified_art = {
            'id': art['id'],
            'title': art.get('meta', {}).get('title', ''),
            'date': art.get('meta', {}).get('date', ''),
            'content': art.get('content', ''),
            'meta': art.get('meta', {})
        }
        
        # Cluster data
        if art_id in cluster_data:
            unified_art['nuovo_cluster_id'] = cluster_data[art_id]['nuovo_cluster_id']
            unified_art['score_coerenza'] = cluster_data[art_id]['score_coerenza']
        else:
            unified_art['nuovo_cluster_id'] = None
            unified_art['score_coerenza'] = None
            stats['missing'].append(f"{art_id}: cluster_data")
        
        # Slug
        if art_id in slugs:
            unified_art['slug'] = slugs[art_id]
            stats['with_slug'] += 1
        else:
            unified_art['slug'] = None
        
        # Immagine
        if art_id in immagini:
            unified_art['immagine'] = immagini[art_id]
            stats['with_image'] += 1
        else:
            unified_art['immagine'] = None
        
        # Commenti
        if art_id in commenti and len(commenti[art_id]) > 0:
            unified_art['commenti'] = commenti[art_id]
            stats['with_comments'] += 1
        else:
            unified_art['commenti'] = []
        
        # Autore
        autore_name = art.get('meta', {}).get('author', '')
        if autore_name:
            # Prova a trovare autore per slug normalizzato
            autore_slug = normalize_autore_name(autore_name)
            
            if autore_slug in autori_map:
                unified_art['autore'] = autori_map[autore_slug]
                stats['with_autore_data'] += 1
            else:
                # Autore non trovato, crea struttura base
                unified_art['autore'] = {
                    'slug': autore_slug,
                    'nome_completo': autore_name,
                    'nome_normalizzato': autore_name
                }
        else:
            unified_art['autore'] = {
                'slug': 'redazione',
                'nome_completo': 'Redazione',
                'nome_normalizzato': 'Redazione'
            }
        
        unified[art_id] = unified_art
    
    print(f"[OK] Unificati {len(unified)} articoli")
    return unified, stats


def generate_report(stats: Dict[str, Any], output_path: Path):
    """Genera report finale"""
    report_lines = []
    report_lines.append("="*60)
    report_lines.append("REPORT UNIFICAZIONE DATI")
    report_lines.append("="*60)
    report_lines.append("")
    report_lines.append(f"Articoli totali nel JSON unificato: {stats['total']}")
    report_lines.append(f"Articoli con almeno un commento: {stats['with_comments']}")
    report_lines.append(f"Articoli con immagine associata: {stats['with_image']}")
    report_lines.append(f"Articoli con slug: {stats['with_slug']}")
    report_lines.append(f"Articoli con dati autore completi: {stats['with_autore_data']}")
    report_lines.append("")
    
    if stats['missing']:
        report_lines.append(f"⚠️  Dati mancanti per {len(stats['missing'])} articoli:")
        for missing in stats['missing'][:10]:  # Mostra primi 10
            report_lines.append(f"  - {missing}")
        if len(stats['missing']) > 10:
            report_lines.append(f"  ... e altri {len(stats['missing']) - 10}")
    
    report_lines.append("")
    report_lines.append("="*60)
    
    report_text = "\n".join(report_lines)
    print("\n" + report_text)
    
    # Salva report
    report_path = output_path.parent / "report_unificazione.txt"
    report_path.write_text(report_text, encoding='utf-8')
    print(f"\n[OK] Report salvato: {report_path}")


def main():
    """Esegue unificazione completa"""
    print("="*60)
    print("UNIFICAZIONE DATI PER ASTRO")
    print("="*60)
    
    # Carica tutti i dati
    articoli = load_articoli()
    cluster_data = load_cluster_data()
    slugs = load_slugs()
    immagini = load_immagini()
    commenti = load_commenti()
    autori_map = load_autori()
    
    # Unifica
    unified, stats = unify_data(articoli, cluster_data, slugs, immagini, commenti, autori_map)
    
    # Salva JSON unificato
    print(f"\nSalvataggio unified_data.json...")
    OUTPUT_UNIFIED.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_UNIFIED.open('w', encoding='utf-8') as f:
        json.dump(unified, f, ensure_ascii=False, indent=2)
    
    print(f"[OK] File salvato: {OUTPUT_UNIFIED}")
    print(f"[OK] Dimensione: {OUTPUT_UNIFIED.stat().st_size / 1024 / 1024:.2f} MB")
    
    # Genera report
    generate_report(stats, OUTPUT_UNIFIED)
    
    print("\n" + "="*60)
    print("COMPLETATO!")
    print("="*60)


if __name__ == "__main__":
    main()
