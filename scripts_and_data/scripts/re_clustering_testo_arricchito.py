#!/usr/bin/env python3
"""
Re-Clustering con Testo Arricchito
Genera embedding e clustering più aggressivo per ridurre Cluster 0
"""

import json
import csv
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from openai import OpenAI
import umap
from collections import Counter
import time

# Prova a importare hdbscan, fallback a DBSCAN se non disponibile
try:
    import hdbscan
    HAS_HDBSCAN = True
except ImportError:
    print("[WARN] hdbscan non disponibile, uso DBSCAN come fallback")
    from sklearn.cluster import DBSCAN
    HAS_HDBSCAN = False

# Paths
INPUT_JSONL = Path("datasets/articoli/articoli_testo_arricchito.jsonl")
OUTPUT_CSV = Path("datasets/articoli/mappa_temi_definitiva.csv")
OUTPUT_EMBEDDINGS = Path("datasets/articoli/embeddings_arricchiti.npy")
OUTPUT_UMAP = Path("datasets/articoli/umap_coordinates.npy")
OUTPUT_CLUSTERS = Path("datasets/articoli/cluster_labels.npy")
OUTPUT_REPORT = Path("datasets/articoli/report_clustering.md")

# Parametri Clustering (Configurazione Bilanciata)
UMAP_PARAMS = {
    'n_neighbors': 12,
    'n_components': 3,
    'min_dist': 0.08,
    'metric': 'cosine',
    'random_state': 42,
    'spread': 1.3,
}

HDBSCAN_PARAMS = {
    'min_cluster_size': 4,
    'min_samples': 2,
    'cluster_selection_epsilon': 0.15,
    'cluster_selection_method': 'eom',
    'metric': 'euclidean',
    'core_dist_n_jobs': -1,
    'prediction_data': True,  # Abilita probabilities_ per score_coerenza
}

# OpenAI
OPENAI_MODEL = "text-embedding-3-large"  # 0.00013 $/1K tokens
MAX_BATCH_SIZE = 100  # Batch per embedding


def load_articoli_arricchiti() -> List[Dict[str, Any]]:
    """Carica articoli con testo arricchito"""
    print("Caricamento articoli da testo arricchito...")
    
    articoli = []
    with INPUT_JSONL.open('r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                articoli.append(json.loads(line))
    
    print(f"[OK] Caricati {len(articoli)} articoli")
    return articoli


def generate_embeddings(articoli: List[Dict[str, Any]], client: OpenAI) -> np.ndarray:
    """Genera embedding usando OpenAI"""
    print("\n" + "="*60)
    print("GENERAZIONE EMBEDDING CON OPENAI")
    print("="*60)
    print(f"Modello: {OPENAI_MODEL}")
    print(f"Totale articoli: {len(articoli)}")
    
    embeddings = []
    total_tokens = 0
    costo_stimato = 0.0
    
    # Estrai testi arricchiti
    testi = [art['text_enriched'] for art in articoli]
    
    # Processa in batch
    for i in range(0, len(testi), MAX_BATCH_SIZE):
        batch = testi[i:i+MAX_BATCH_SIZE]
        batch_ids = [art['id'] for art in articoli[i:i+MAX_BATCH_SIZE]]
        
        print(f"\nProcessando batch {i//MAX_BATCH_SIZE + 1}/{(len(testi)-1)//MAX_BATCH_SIZE + 1}...")
        print(f"  Articoli: {i+1}-{min(i+MAX_BATCH_SIZE, len(testi))}")
        
        try:
            response = client.embeddings.create(
                model=OPENAI_MODEL,
                input=batch
            )
            
            batch_embeddings = [item.embedding for item in response.data]
            embeddings.extend(batch_embeddings)
            
            # Stima token (approssimativa: ~4 caratteri per token)
            batch_tokens = sum(len(t) // 4 for t in batch)
            total_tokens += batch_tokens
            costo_batch = (batch_tokens / 1000) * 0.00013
            costo_stimato += costo_batch
            
            print(f"  [OK] Embedding generati, costo stimato: ${costo_batch:.4f}")
            
            # Rate limiting
            time.sleep(0.1)
        
        except Exception as e:
            print(f"  [ERROR] Errore batch {i//MAX_BATCH_SIZE + 1}: {e}")
            # In caso di errore, usa embedding zero
            embeddings.extend([[0.0] * 3072] * len(batch))  # text-embedding-3-large ha 3072 dimensioni
    
    embeddings_array = np.array(embeddings, dtype=np.float32)
    
    print("\n" + "="*60)
    print("RIEPILOGO EMBEDDING")
    print("="*60)
    print(f"[OK] Embedding generati: {len(embeddings_array)}")
    print(f"[OK] Dimensioni: {embeddings_array.shape}")
    print(f"[OK] Token stimati: {total_tokens:,}")
    print(f"[OK] Costo stimato totale: ${costo_stimato:.4f}")
    print(f"[OK] Budget disponibile: $3.54")
    print(f"[OK] Budget rimanente: ${3.54 - costo_stimato:.4f}")
    
    if costo_stimato > 3.54:
        print(f"\n[WARN] Costo stimato supera il budget!")
        print(f"[INFO] Considera di ridurre il numero di articoli o usare un modello più economico")
    
    return embeddings_array


def apply_umap(embeddings: np.ndarray) -> np.ndarray:
    """Applica UMAP per riduzione dimensionalità"""
    print("\n" + "="*60)
    print("UMAP - RIDUZIONE DIMENSIONALITÀ")
    print("="*60)
    print(f"Parametri: {UMAP_PARAMS}")
    
    reducer = umap.UMAP(**UMAP_PARAMS)
    embedding_reduced = reducer.fit_transform(embeddings)
    
    print(f"[OK] Dimensioni ridotte: {embedding_reduced.shape}")
    print(f"[OK] Da {embeddings.shape[1]}D a {embedding_reduced.shape[1]}D")
    
    return embedding_reduced


def apply_hdbscan(embedding_reduced: np.ndarray) -> Tuple[np.ndarray, Any]:
    """Applica HDBSCAN per clustering (o DBSCAN come fallback)
    
    Returns:
        tuple: (cluster_labels, clusterer) per accedere a probabilities_
    """
    print("\n" + "="*60)
    if HAS_HDBSCAN:
        print("HDBSCAN - CLUSTERING")
    else:
        print("DBSCAN - CLUSTERING (fallback)")
    print("="*60)
    print(f"Parametri: {HDBSCAN_PARAMS}")
    
    if HAS_HDBSCAN:
        clusterer = hdbscan.HDBSCAN(**HDBSCAN_PARAMS)
        cluster_labels = clusterer.fit_predict(embedding_reduced)
    else:
        # Fallback a DBSCAN con parametri equivalenti
        # DBSCAN non supporta cluster_selection_epsilon, usiamo eps
        eps_value = 0.5  # Valore di default per DBSCAN
        clusterer = DBSCAN(
            eps=eps_value,
            min_samples=HDBSCAN_PARAMS['min_samples'],
            metric=HDBSCAN_PARAMS['metric']
        )
        cluster_labels = clusterer.fit_predict(embedding_reduced)
    
    # Statistiche
    unique_labels = np.unique(cluster_labels)
    cluster_0_count = np.sum(cluster_labels == -1)
    cluster_0_pct = (cluster_0_count / len(cluster_labels)) * 100
    num_clusters = len(unique_labels) - (1 if -1 in unique_labels else 0)
    
    print(f"[OK] Clustering completato")
    print(f"[OK] Numero cluster: {num_clusters}")
    print(f"[OK] Cluster 0 (outlier): {cluster_0_count} articoli ({cluster_0_pct:.1f}%)")
    
    # Distribuzione cluster
    cluster_counts = Counter(cluster_labels)
    print(f"\n[INFO] Top 10 cluster per dimensione:")
    for label, count in cluster_counts.most_common(10):
        if label == -1:
            print(f"  Cluster -1 (outlier): {count} articoli")
        else:
            print(f"  Cluster {label}: {count} articoli")
    
    return cluster_labels, clusterer


def generate_tema_labels(cluster_labels: np.ndarray, articoli: List[Dict[str, Any]]) -> Dict[int, str]:
    """Genera label tematici provvisori per ogni cluster"""
    print("\n" + "="*60)
    print("GENERAZIONE LABEL TEMATICI PROVVISORI")
    print("="*60)
    
    # Raggruppa articoli per cluster
    cluster_articoli = {}
    for idx, label in enumerate(cluster_labels):
        if label not in cluster_articoli:
            cluster_articoli[label] = []
        cluster_articoli[label].append(articoli[idx])
    
    # Genera label provvisori basati su tag/categorie più comuni
    tema_labels = {}
    
    for cluster_id, arts in cluster_articoli.items():
        if cluster_id == -1:
            tema_labels[cluster_id] = "Cluster 0 - Da analizzare"
            continue
        
        # Estrai tag e categorie più comuni
        all_tags = []
        all_categories = []
        
        for art in arts:
            tags = art.get('tags_slugs', '').split(',') if art.get('tags_slugs') else []
            categories = art.get('categories_slugs', '').split(',') if art.get('categories_slugs') else []
            all_tags.extend([t.strip() for t in tags if t.strip()])
            all_categories.extend([c.strip() for c in categories if c.strip()])
        
        # Filtra categorie "numero-X" (non informative)
        all_categories = [c for c in all_categories if not c.startswith('numero-')]
        
        # Trova più comuni
        tag_counter = Counter(all_tags)
        cat_counter = Counter(all_categories)
        
        top_tag = tag_counter.most_common(1)[0][0] if tag_counter else None
        top_cat = cat_counter.most_common(1)[0][0] if cat_counter else None
        
        # Genera label
        if top_tag and top_cat:
            label = f"{top_cat} - {top_tag}"
        elif top_tag:
            label = f"Tema: {top_tag}"
        elif top_cat:
            label = f"Categoria: {top_cat}"
        else:
            label = f"Cluster {cluster_id}"
        
        tema_labels[cluster_id] = label
    
    print(f"[OK] Label generati per {len(tema_labels)} cluster")
    
    return tema_labels


def calculate_coherence_scores(cluster_labels: np.ndarray, embedding_reduced: np.ndarray, clusterer) -> np.ndarray:
    """Calcola score di coerenza per ogni articolo
    
    Usa:
    - Probabilità HDBSCAN (se disponibile)
    - Distanza normalizzata dal centroide del cluster
    """
    scores = np.zeros(len(cluster_labels), dtype=np.float32)
    
    # Usa probabilità HDBSCAN se disponibile
    if HAS_HDBSCAN and hasattr(clusterer, 'probabilities_') and clusterer.probabilities_ is not None:
        scores = clusterer.probabilities_.astype(np.float32)
        print("[INFO] Usate probabilità HDBSCAN per score_coerenza")
    else:
        # Calcola distanza dal centroide come fallback
        print("[INFO] Calcolo score_coerenza basato su distanza dal centroide")
        unique_labels = np.unique(cluster_labels)
        
        for label in unique_labels:
            if label == -1:
                # Outlier: score 0
                scores[cluster_labels == -1] = 0.0
            else:
                # Trova punti del cluster
                mask = cluster_labels == label
                cluster_points = embedding_reduced[mask]
                
                # Calcola centroide
                centroid = np.mean(cluster_points, axis=0)
                
                # Calcola distanze dal centroide
                distances = np.linalg.norm(embedding_reduced[mask] - centroid, axis=1)
                
                # Normalizza: distanza più piccola = score più alto
                if distances.max() > 0:
                    normalized = 1.0 - (distances / distances.max())
                else:
                    normalized = np.ones(len(distances))
                
                scores[mask] = normalized
    
    return scores


def create_mappa_temi(articoli: List[Dict[str, Any]], cluster_labels: np.ndarray, tema_labels: Dict[int, str], coherence_scores: np.ndarray) -> None:
    """Crea file CSV mappa_temi_definitiva.csv"""
    print("\n" + "="*60)
    print("CREAZIONE MAPPA TEMI DEFINITIVA")
    print("="*60)
    
    OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    
    with OUTPUT_CSV.open('w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['id_articolo', 'nuovo_cluster_id', 'score_coerenza'])
        writer.writeheader()
        
        for idx, art in enumerate(articoli):
            cluster_id = int(cluster_labels[idx])
            score = float(coherence_scores[idx])
            
            writer.writerow({
                'id_articolo': art['id'],
                'nuovo_cluster_id': cluster_id,
                'score_coerenza': f"{score:.4f}"
            })
    
    print(f"[OK] File creato: {OUTPUT_CSV}")
    print(f"[OK] Totale record: {len(articoli)}")
    print(f"[OK] Score coerenza medio: {coherence_scores.mean():.4f}")
    print(f"[OK] Score coerenza min: {coherence_scores.min():.4f}")
    print(f"[OK] Score coerenza max: {coherence_scores.max():.4f}")


def save_intermediate_files(embeddings: np.ndarray, umap_coords: np.ndarray, cluster_labels: np.ndarray) -> None:
    """Salva file intermedi per analisi"""
    OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    
    np.save(OUTPUT_EMBEDDINGS, embeddings)
    np.save(OUTPUT_UMAP, umap_coords)
    np.save(OUTPUT_CLUSTERS, cluster_labels)
    
    print(f"\n[OK] File intermedi salvati:")
    print(f"  - {OUTPUT_EMBEDDINGS}")
    print(f"  - {OUTPUT_UMAP}")
    print(f"  - {OUTPUT_CLUSTERS}")


def generate_report(articoli: List[Dict[str, Any]], cluster_labels: np.ndarray, tema_labels: Dict[int, str]) -> None:
    """Genera report clustering"""
    OUTPUT_REPORT.parent.mkdir(parents=True, exist_ok=True)
    
    cluster_counts = Counter(cluster_labels)
    cluster_0_count = cluster_counts.get(-1, 0)
    cluster_0_pct = (cluster_0_count / len(cluster_labels)) * 100
    
    lines = []
    lines.append("# Report Clustering con Testo Arricchito")
    lines.append("")
    lines.append(f"**Data:** {time.strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append("")
    lines.append("## Parametri Utilizzati")
    lines.append("")
    lines.append("### UMAP")
    lines.append("```python")
    lines.append(json.dumps(UMAP_PARAMS, indent=2))
    lines.append("```")
    lines.append("")
    lines.append("### HDBSCAN")
    lines.append("```python")
    lines.append(json.dumps(HDBSCAN_PARAMS, indent=2))
    lines.append("```")
    lines.append("")
    lines.append("## Risultati")
    lines.append("")
    lines.append(f"- **Totale articoli:** {len(articoli)}")
    lines.append(f"- **Numero cluster:** {len(set(cluster_labels)) - (1 if -1 in cluster_labels else 0)}")
    lines.append(f"- **Cluster 0 (outlier):** {cluster_0_count} articoli ({cluster_0_pct:.1f}%)")
    lines.append(f"- **Obiettivo:** < 40%")
    lines.append(f"- **Risultato:** {'✅ RAGGIUNTO' if cluster_0_pct < 40 else '❌ NON RAGGIUNTO'}")
    lines.append("")
    lines.append("## Distribuzione Cluster")
    lines.append("")
    lines.append("| Cluster ID | Label Tematico | Articoli | % |")
    lines.append("|------------|----------------|----------|---|")
    
    for cluster_id, count in sorted(cluster_counts.items()):
        label = tema_labels.get(cluster_id, f"Cluster {cluster_id}")
        pct = (count / len(cluster_labels)) * 100
        lines.append(f"| {cluster_id} | {label} | {count} | {pct:.1f}% |")
    
    OUTPUT_REPORT.write_text("\n".join(lines), encoding='utf-8')
    print(f"[OK] Report salvato: {OUTPUT_REPORT}")


def main():
    """Esegue re-clustering completo"""
    print("="*60)
    print("RE-CLUSTERING CON TESTO ARRICCHITO")
    print("="*60)
    
    # Verifica file input
    if not INPUT_JSONL.exists():
        print(f"[ERROR] File non trovato: {INPUT_JSONL}")
        return
    
    # Carica articoli
    articoli = load_articoli_arricchiti()
    
    if not articoli:
        print("[ERROR] Nessun articolo caricato")
        return
    
    # Inizializza OpenAI
    print("\n[INFO] Inizializzazione OpenAI client...")
    try:
        client = OpenAI()
    except Exception as e:
        print(f"[ERROR] Errore inizializzazione OpenAI: {e}")
        print("[INFO] Assicurati di avere OPENAI_API_KEY impostata")
        return
    
    # 1. Genera embedding
    embeddings = generate_embeddings(articoli, client)
    
    # Salva embedding intermedi
    save_intermediate_files(embeddings, None, None)
    
    # 2. Applica UMAP
    embedding_reduced = apply_umap(embeddings)
    
    # 3. Applica HDBSCAN
    cluster_labels, clusterer = apply_hdbscan(embedding_reduced)
    
    # Salva coordinate UMAP e cluster
    save_intermediate_files(embeddings, embedding_reduced, cluster_labels)
    
    # 4. Calcola score coerenza
    coherence_scores = calculate_coherence_scores(cluster_labels, embedding_reduced, clusterer)
    
    # 5. Genera label tematici
    tema_labels = generate_tema_labels(cluster_labels, articoli)
    
    # 6. Crea mappa temi
    create_mappa_temi(articoli, cluster_labels, tema_labels, coherence_scores)
    
    # 7. Genera report
    generate_report(articoli, cluster_labels, tema_labels)
    
    print("\n" + "="*60)
    print("COMPLETATO!")
    print("="*60)
    print(f"[OK] File principale: {OUTPUT_CSV}")
    print(f"[OK] Report: {OUTPUT_REPORT}")


if __name__ == "__main__":
    main()

