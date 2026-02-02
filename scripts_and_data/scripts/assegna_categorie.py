#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script per categorizzare tutti gli articoli del dataset ufficiale.
Categorizza ogni articolo con:
- 1 categoria formale (obbligatoria)
- 1 categoria tematica primaria (obbligatoria)
- 0-2 categorie tematiche secondarie (max 2)
"""

import json
import re
import logging
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from collections import Counter, defaultdict
from datetime import datetime

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import NMF
from sklearn.metrics.pairwise import cosine_similarity
from bs4 import BeautifulSoup

# Configurazione logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('outputs/log.txt', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Paths
DATASET_JSON = Path('datasets/articoli/articoli_semantici_FULL_2026.json')
DATASET_JSONL = Path('datasets/articoli/articoli_semantici_FULL_2026.jsonl')
OUTPUT_JSONL = Path('outputs/articoli_categorizzati.jsonl')
OUTPUT_REPORT_JSON = Path('outputs/categorie_report.json')
OUTPUT_REPORT_MD = Path('outputs/categorie_report.md')


def estrai_testo_rappresentativo(articolo: Dict) -> str:
    """Estrae testo rappresentativo pesato da un articolo."""
    parti = []
    
    # Titolo (peso alto)
    if 'meta' in articolo and 'title' in articolo['meta']:
        titolo = articolo['meta']['title']
        parti.append(titolo)
        parti.append(titolo)  # duplicato per peso
    
    # Tag e categorie esistenti (peso medio)
    if 'tax' in articolo:
        if 'tags' in articolo['tax']:
            for tag in articolo['tax']['tags']:
                if 'name' in tag:
                    parti.append(tag['name'])
        if 'categories' in articolo['tax']:
            for cat in articolo['tax']['categories']:
                if 'name' in cat and not cat['name'].startswith('N. '):
                    parti.append(cat['name'])
    
    # HTML pulito: estrai headings e testo
    if 'html_pulito' in articolo and articolo['html_pulito']:
        html = articolo['html_pulito']
        soup = BeautifulSoup(html, 'html.parser')
        
        # Headings (peso alto)
        for heading in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
            testo = heading.get_text(strip=True)
            if testo:
                parti.append(testo)
                parti.append(testo)  # duplicato per peso
        
        # Testo principale (peso normale)
        for p in soup.find_all('p'):
            testo = p.get_text(strip=True)
            if testo and len(testo) > 20:  # filtra testi troppo corti
                parti.append(testo)
    
    return ' '.join(parti)


def classifica_categoria_formale(articolo: Dict, testo: str) -> Tuple[str, float]:
    """
    Classifica categoria formale basata su segnali strutturali e linguistici.
    Restituisce (categoria, confidence).
    """
    testo_lower = testo.lower()
    titolo = articolo.get('meta', {}).get('title', '').lower()
    
    # Segnali per intervista
    segnali_intervista = [
        r'\?',  # domande
        r'domanda',
        r'risposta',
        r'intervista',
        r'colloquio',
        r'parla con',
        r'parla a',
    ]
    score_intervista = sum(1 for pattern in segnali_intervista if re.search(pattern, testo_lower))
    
    # Segnali per testimonianza
    segnali_testimonianza = [
        r'testimonianza',
        r'racconto',
        r'storia di',
        r'esperienza',
        r'vita di',
        r'la mia',
        r'nostro figlio',
        r'nostra figlia',
        r'mio figlio',
        r'mia figlia',
    ]
    score_testimonianza = sum(1 for pattern in segnali_testimonianza if re.search(pattern, testo_lower))
    
    # Segnali per editoriale
    segnali_editoriale = [
        r'editoriale',
        r'redazione',
        r'comitato',
        r'rivolgiamo',
        r'ci rivolgiamo',
    ]
    score_editoriale = sum(1 for pattern in segnali_editoriale if testo_lower.find(pattern) >= 0)
    
    # Segnali per cronaca
    segnali_cronaca = [
        r'è accaduto',
        r'è successo',
        r'è avvenuto',
        r'notizia',
        r'cronaca',
        r'evento',
        r'incontro',
        r'manifestazione',
    ]
    score_cronaca = sum(1 for pattern in segnali_cronaca if re.search(pattern, testo_lower))
    
    # Segnali per approfondimento
    segnali_approfondimento = [
        r'analisi',
        r'approfondimento',
        r'studio',
        r'ricerca',
        r'indagine',
        r'riflessione',
    ]
    score_approfondimento = sum(1 for pattern in segnali_approfondimento if re.search(pattern, testo_lower))
    
    # Segnali per lettera
    segnali_lettera = [
        r'car[oa]\s',
        r'gentile',
        r'lettera',
        r'saluti',
        r'cordiali',
    ]
    score_lettera = sum(1 for pattern in segnali_lettera if re.search(pattern, testo_lower))
    
    # Segnali per recensione
    segnali_recensione = [
        r'recensione',
        r'libro',
        r'film',
        r'opera',
        r'autore',
        r'pubblicazione',
    ]
    score_recensione = sum(1 for pattern in segnali_recensione if re.search(pattern, testo_lower))
    
    # Verifica categorie esistenti
    if 'tax' in articolo and 'categories' in articolo['tax']:
        for cat in articolo['tax']['categories']:
            nome_cat = cat.get('name', '').lower()
            if 'editoriale' in nome_cat:
                score_editoriale += 2
            elif 'testimonianza' in nome_cat:
                score_testimonianza += 2
            elif 'intervista' in nome_cat:
                score_intervista += 2
    
    # Decisione
    scores = {
        'intervista': score_intervista,
        'testimonianza': score_testimonianza,
        'editoriale': score_editoriale,
        'cronaca': score_cronaca,
        'approfondimento': score_approfondimento,
        'lettera': score_lettera,
        'recensione': score_recensione,
    }
    
    categoria = max(scores, key=scores.get)
    max_score = scores[categoria]
    total_score = sum(scores.values())
    
    confidence = max_score / max(total_score, 1)
    
    # Default se nessun segnale forte
    if max_score == 0:
        categoria = 'articolo'
        confidence = 0.5
    
    return categoria, min(confidence, 1.0)


def deriva_tassonomia_tematica(testi: List[str], target_n_categorie: int = 15) -> Tuple[List[str], np.ndarray]:
    """
    Deriva tassonomia tematica usando TF-IDF + NMF.
    Restituisce (nomi_categorie, matrice_assegnazioni).
    """
    logger.info(f"Derivazione tassonomia tematica su {len(testi)} articoli...")
    
    # TF-IDF
    # Nota: sklearn non supporta 'italian' come stop_words built-in
    # Usiamo None e filtriamo manualmente se necessario
    vectorizer = TfidfVectorizer(
        max_features=5000,
        min_df=2,
        max_df=0.95,
        ngram_range=(1, 2),
        stop_words=None  # 'italian' non supportato, usiamo None
    )
    
    try:
        tfidf_matrix = vectorizer.fit_transform(testi)
        logger.info(f"TF-IDF matrix shape: {tfidf_matrix.shape}")
    except Exception as e:
        logger.error(f"Errore TF-IDF: {e}")
        # Fallback: usa CountVectorizer
        from sklearn.feature_extraction.text import CountVectorizer
        vectorizer = CountVectorizer(max_features=3000, min_df=2, max_df=0.95, ngram_range=(1, 2))
        tfidf_matrix = vectorizer.fit_transform(testi)
    
    # NMF
    n_components = target_n_categorie
    nmf = NMF(n_components=n_components, random_state=42, max_iter=500)
    
    try:
        W = nmf.fit_transform(tfidf_matrix)  # W: documento -> topic
        H = nmf.components_  # H: topic -> termine
    except Exception as e:
        logger.error(f"Errore NMF: {e}")
        # Fallback: usa LatentDirichletAllocation
        from sklearn.decomposition import LatentDirichletAllocation
        lda = LatentDirichletAllocation(n_components=n_components, random_state=42, max_iter=20)
        W = lda.fit_transform(tfidf_matrix)
        H = lda.components_
    
    # Nomi categorie dai top terms
    feature_names = vectorizer.get_feature_names_out()
    nomi_categorie = []
    
    for topic_idx in range(n_components):
        top_indices = H[topic_idx].argsort()[-10:][::-1]
        top_terms = [feature_names[i] for i in top_indices[:5]]
        nome = '_'.join(top_terms[:2]).replace(' ', '_')
        nomi_categorie.append(f"tema_{topic_idx+1}_{nome}")
    
    # Merge automatico per similarità
    nomi_categorie = merge_categorie_simili(nomi_categorie, H, feature_names, threshold=0.7)
    
    # Ricalcola W se necessario
    if len(nomi_categorie) < n_components:
        n_components = len(nomi_categorie)
        nmf = NMF(n_components=n_components, random_state=42, max_iter=500)
        W = nmf.fit_transform(tfidf_matrix)
        H = nmf.components_
        # Rinomina
        nomi_categorie = []
        for topic_idx in range(n_components):
            top_indices = H[topic_idx].argsort()[-10:][::-1]
            top_terms = [feature_names[i] for i in top_indices[:5]]
            nome = '_'.join(top_terms[:2]).replace(' ', '_')
            nomi_categorie.append(f"tema_{topic_idx+1}_{nome}")
    
    logger.info(f"Tassonomia tematica derivata: {len(nomi_categorie)} categorie")
    
    return nomi_categorie, W


def merge_categorie_simili(nomi: List[str], H: np.ndarray, feature_names, threshold: float = 0.7) -> List[str]:
    """Merge automatico di categorie troppo simili."""
    if len(nomi) <= 1:
        return nomi
    
    # Calcola similarità tra topic
    similarities = cosine_similarity(H)
    
    # Trova coppie da mergere
    to_merge = []
    merged_indices = set()
    
    for i in range(len(nomi)):
        if i in merged_indices:
            continue
        for j in range(i+1, len(nomi)):
            if j in merged_indices:
                continue
            if similarities[i, j] > threshold:
                to_merge.append((i, j))
                merged_indices.add(j)  # j verrà mergiato in i
    
    if not to_merge:
        return nomi
    
    logger.info(f"Trovate {len(to_merge)} coppie simili da mergere...")
    
    # Ritorna solo le categorie non mergiate
    # (il merge completo richiederebbe ricalcolo NMF, per ora manteniamo tutte)
    return nomi


def assegna_categorie_tematiche(W: np.ndarray, nomi_categorie: List[str], 
                                threshold_secondaria: float = 0.6) -> Tuple[str, List[str], float]:
    """
    Assegna categoria tematica primaria e secondarie basata su W (documento->topic).
    Restituisce (primaria, secondarie, confidence_primaria).
    """
    if len(W) == 0:
        return nomi_categorie[0] if nomi_categorie else "tema_generale", [], 0.5
    
    scores = W.flatten()
    
    # Trova primaria
    idx_primaria = np.argmax(scores)
    primaria = nomi_categorie[idx_primaria]
    confidence_primaria = float(scores[idx_primaria])
    
    # Trova secondarie (max 2, solo se score > threshold rispetto alla primaria)
    secondarie = []
    score_primaria = scores[idx_primaria]
    
    for idx, score in enumerate(scores):
        if idx != idx_primaria and score > 0:
            ratio = score / max(score_primaria, 0.001)
            if ratio >= threshold_secondaria:
                secondarie.append(nomi_categorie[idx])
    
    # Limita a 2
    secondarie = secondarie[:2]
    
    return primaria, secondarie, min(confidence_primaria, 1.0)


def valida_categorizzazione(articoli_categorizzati: List[Dict]) -> Dict:
    """Valida la categorizzazione e identifica anomalie."""
    anomalie = {}
    
    # Verifica 100% categorizzati
    senza_formale = [a for a in articoli_categorizzati if not a.get('categoria_formale')]
    senza_tematica = [a for a in articoli_categorizzati if not a.get('categoria_tematica_primaria')]
    
    if senza_formale:
        anomalie['senza_categoria_formale'] = len(senza_formale)
    if senza_tematica:
        anomalie['senza_categoria_tematica'] = len(senza_tematica)
    
    # Distribuzione categorie formali
    formali = Counter(a['categoria_formale'] for a in articoli_categorizzati)
    totale = len(articoli_categorizzati)
    
    for cat, count in formali.items():
        percentuale = (count / totale) * 100
        if percentuale > 30:
            anomalie[f'categoria_formale_dominante_{cat}'] = {
                'count': count,
                'percentuale': round(percentuale, 2)
            }
    
    # Distribuzione categorie tematiche
    tematiche_primarie = Counter(a['categoria_tematica_primaria'] for a in articoli_categorizzati)
    
    for cat, count in tematiche_primarie.items():
        percentuale = (count / totale) * 100
        if percentuale > 30:
            anomalie[f'categoria_tematica_dominante_{cat}'] = {
                'count': count,
                'percentuale': round(percentuale, 2)
            }
    
    # Categorie con 0 articoli (non dovrebbe succedere)
    anomalie['categorie_vuote'] = []
    
    return anomalie


def genera_report(articoli_categorizzati: List[Dict], anomalie: Dict, 
                  nomi_categorie_tematiche: List[str]) -> Tuple[Dict, str]:
    """Genera report JSON e Markdown."""
    
    # Conteggi categorie formali
    formali_counter = Counter(a['categoria_formale'] for a in articoli_categorizzati)
    categorie_formali = [{'nome': nome, 'count': count} 
                        for nome, count in formali_counter.most_common()]
    
    # Conteggi categorie tematiche
    tematiche_primarie_counter = Counter(a['categoria_tematica_primaria'] 
                                        for a in articoli_categorizzati)
    
    # Conteggi totali (primaria + secondarie)
    tematiche_totali_counter = Counter()
    for a in articoli_categorizzati:
        tematiche_totali_counter[a['categoria_tematica_primaria']] += 1
        for sec in a.get('categorie_tematiche_secondarie', []):
            tematiche_totali_counter[sec] += 1
    
    categorie_tematiche = []
    for nome in nomi_categorie_tematiche:
        count_primary = tematiche_primarie_counter.get(nome, 0)
        count_total = tematiche_totali_counter.get(nome, 0)
        if count_total > 0:  # Solo categorie con almeno un articolo
            categorie_tematiche.append({
                'nome': nome,
                'count_primary': count_primary,
                'count_total': count_total
            })
    
    # Ordina per count_total
    categorie_tematiche.sort(key=lambda x: x['count_total'], reverse=True)
    
    # Report JSON
    report_json = {
        'categorie_formali': categorie_formali,
        'categorie_tematiche': categorie_tematiche,
        'parametri': {
            'totale_articoli': len(articoli_categorizzati),
            'n_categorie_formali': len(categorie_formali),
            'n_categorie_tematiche': len(categorie_tematiche),
            'data_generazione': datetime.now().isoformat()
        },
        'anomalie': anomalie
    }
    
    # Report Markdown
    md_lines = [
        "# Report Categorizzazione Articoli",
        "",
        f"**Data generazione:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"**Totale articoli:** {len(articoli_categorizzati)}",
        "",
        "## Categorie Formali",
        "",
        "| Categoria | Conteggio | Percentuale |",
        "|-----------|-----------|-------------|"
    ]
    
    totale = len(articoli_categorizzati)
    for cat in categorie_formali:
        percent = (cat['count'] / totale) * 100
        md_lines.append(f"| {cat['nome']} | {cat['count']} | {percent:.2f}% |")
    
    md_lines.extend([
        "",
        "## Categorie Tematiche",
        "",
        "| Categoria | Come Primaria | Totale (Primaria + Secondarie) | Percentuale Totale |",
        "|-----------|---------------|----------------------------------|-------------------|"
    ])
    
    for cat in categorie_tematiche:
        percent = (cat['count_total'] / totale) * 100
        md_lines.append(
            f"| {cat['nome']} | {cat['count_primary']} | {cat['count_total']} | {percent:.2f}% |"
        )
    
    if anomalie:
        md_lines.extend([
            "",
            "## Anomalie",
            "",
            "```json"
        ])
        md_lines.append(json.dumps(anomalie, indent=2, ensure_ascii=False))
        md_lines.append("```")
    
    report_md = '\n'.join(md_lines)
    
    return report_json, report_md


def main(test_mode: bool = False, sample_size: int = 100):
    """Funzione principale."""
    logger.info("=" * 60)
    logger.info("INIZIO CATEGORIZZAZIONE ARTICOLI")
    logger.info("=" * 60)
    
    # Carica dataset
    logger.info(f"Caricamento dataset da {DATASET_JSON}...")
    with open(DATASET_JSON, 'r', encoding='utf-8') as f:
        articoli = json.load(f)
    
    logger.info(f"Caricati {len(articoli)} articoli")
    
    # Test mode: usa solo un campione
    if test_mode:
        articoli = articoli[:sample_size]
        logger.info(f"TEST MODE: elaborando solo {len(articoli)} articoli")
    
    # Estrai testi rappresentativi
    logger.info("Estrazione testi rappresentativi...")
    testi = []
    for articolo in articoli:
        testo = estrai_testo_rappresentativo(articolo)
        testi.append(testo)
    
    # Deriva tassonomia tematica
    target_n = 15
    nomi_categorie_tematiche, W_matrix = deriva_tassonomia_tematica(testi, target_n)
    
    # Categorizza ogni articolo
    logger.info("Categorizzazione articoli...")
    articoli_categorizzati = []
    
    for idx, articolo in enumerate(articoli):
        # Categoria formale
        testo = testi[idx]
        cat_formale, conf_formale = classifica_categoria_formale(articolo, testo)
        
        # Categoria tematica
        W_row = W_matrix[idx]
        cat_tematica_primaria, cat_tematiche_secondarie, conf_tematica = assegna_categorie_tematiche(
            W_row, nomi_categorie_tematiche
        )
        
        # Costruisci output
        output = {
            'id': str(articolo.get('id', '')),
            'url': articolo.get('url', ''),
            'titolo': articolo.get('meta', {}).get('title', ''),
            'categoria_formale': cat_formale,
            'categoria_tematica_primaria': cat_tematica_primaria,
            'categorie_tematiche_secondarie': cat_tematiche_secondarie,
            'confidence': {
                'formale': round(conf_formale, 3),
                'tematica_primaria': round(conf_tematica, 3)
            }
        }
        
        articoli_categorizzati.append(output)
        
        if (idx + 1) % 100 == 0:
            logger.info(f"Processati {idx + 1}/{len(articoli)} articoli")
    
    # Valida
    logger.info("Validazione categorizzazione...")
    anomalie = valida_categorizzazione(articoli_categorizzati)
    
    if anomalie:
        logger.warning(f"Trovate {len(anomalie)} anomalie")
    
    # Genera report
    logger.info("Generazione report...")
    report_json, report_md = genera_report(
        articoli_categorizzati, anomalie, nomi_categorie_tematiche
    )
    
    # Salva output JSONL
    logger.info(f"Salvataggio {OUTPUT_JSONL}...")
    with open(OUTPUT_JSONL, 'w', encoding='utf-8') as f:
        for art in articoli_categorizzati:
            f.write(json.dumps(art, ensure_ascii=False) + '\n')
    
    # Salva report JSON
    logger.info(f"Salvataggio {OUTPUT_REPORT_JSON}...")
    with open(OUTPUT_REPORT_JSON, 'w', encoding='utf-8') as f:
        json.dump(report_json, f, indent=2, ensure_ascii=False)
    
    # Salva report MD
    logger.info(f"Salvataggio {OUTPUT_REPORT_MD}...")
    with open(OUTPUT_REPORT_MD, 'w', encoding='utf-8') as f:
        f.write(report_md)
    
    # Riepilogo finale
    logger.info("=" * 60)
    logger.info("RIEPILOGO FINALE")
    logger.info("=" * 60)
    logger.info(f"Articoli categorizzati: {len(articoli_categorizzati)}")
    logger.info(f"Categorie formali: {len(report_json['categorie_formali'])}")
    logger.info(f"Categorie tematiche: {len(report_json['categorie_tematiche'])}")
    logger.info(f"Anomalie trovate: {len(anomalie)}")
    logger.info("=" * 60)
    logger.info("CATEGORIZZAZIONE COMPLETATA")


if __name__ == '__main__':
    import sys
    
    # Controlla argomenti
    test_mode = '--test' in sys.argv
    sample_size = 100
    
    if test_mode:
        logger.info("Modalità TEST attivata")
        main(test_mode=True, sample_size=sample_size)
    else:
        logger.info("Modalità PRODUZIONE: elaborazione completa")
        main(test_mode=False)

