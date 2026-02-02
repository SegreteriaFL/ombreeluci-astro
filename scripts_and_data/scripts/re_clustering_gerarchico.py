#!/usr/bin/env python3
"""
Re-Clustering Gerarchico Agglomerativo
Usa embedding esistenti e testa configurazioni da 15 a 25 cluster
"""

import json
import csv
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Tuple
from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics import silhouette_score
from collections import Counter
import time

# Paths
INPUT_JSONL = Path("datasets/articoli/articoli_testo_arricchito.jsonl")
INPUT_EMBEDDINGS = Path("datasets/articoli/embeddings_arricchiti.npy")
OUTPUT_CSV = Path("datasets/articoli/mappa_temi_definitiva.csv")
OUTPUT_REPORT = Path("datasets/articoli/report_clustering_gerarchico.md")
THEMES_JSON = Path("categorie v2/themes_v1.json")

# Parametri test
MIN_CLUSTERS = 15
MAX_CLUSTERS = 25
LINKAGE = 'ward'  # ward linkage funziona bene con euclidean distance
METRIC = 'euclidean'


def load_articoli() -> List[Dict[str, Any]]:
    """Carica articoli con testo arricchito"""
    print("Caricamento articoli...")
    articoli = []
    with INPUT_JSONL.open('r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                articoli.append(json.loads(line))
    print(f"[OK] Caricati {len(articoli)} articoli")
    return articoli


def load_embeddings() -> np.ndarray:
    """Carica embedding esistenti"""
    print("\nCaricamento embedding esistenti...")
    if not INPUT_EMBEDDINGS.exists():
        raise FileNotFoundError(f"File embedding non trovato: {INPUT_EMBEDDINGS}")
    
    embeddings = np.load(INPUT_EMBEDDINGS)
    print(f"[OK] Embedding caricati: {embeddings.shape}")
    return embeddings


def test_clustering_configurations(embeddings: np.ndarray, min_n: int, max_n: int) -> List[Tuple[int, float, np.ndarray]]:
    """Testa configurazioni da min_n a max_n cluster e calcola Silhouette Score
    
    Returns:
        List di tuple (n_clusters, silhouette_score, cluster_labels)
    """
    print("\n" + "="*60)
    print("TEST CONFIGURAZIONI CLUSTERING")
    print("="*60)
    print(f"Range cluster: {min_n} - {max_n}")
    print(f"Linkage: {LINKAGE}, Metric: {METRIC}")
    
    results = []
    
    for n_clusters in range(min_n, max_n + 1):
        print(f"\nTestando {n_clusters} cluster...", end=" ")
        
        # Clustering gerarchico
        clusterer = AgglomerativeClustering(
            n_clusters=n_clusters,
            linkage=LINKAGE,
            metric=METRIC
        )
        cluster_labels = clusterer.fit_predict(embeddings)
        
        # Calcola Silhouette Score
        # Nota: silhouette_score può essere lento su dataset grandi
        # Usiamo un campione se necessario
        if len(embeddings) > 2000:
            # Campiona per velocità
            sample_size = 2000
            sample_indices = np.random.choice(len(embeddings), sample_size, replace=False)
            sample_embeddings = embeddings[sample_indices]
            sample_labels = cluster_labels[sample_indices]
            silhouette = silhouette_score(sample_embeddings, sample_labels, metric='euclidean')
            print(f"Silhouette (campione {sample_size}): {silhouette:.4f}")
        else:
            silhouette = silhouette_score(embeddings, cluster_labels, metric='euclidean')
            print(f"Silhouette: {silhouette:.4f}")
        
        results.append((n_clusters, silhouette, cluster_labels))
    
    return results


def choose_best_configuration(results: List[Tuple[int, float, np.ndarray]], 
                               embeddings: np.ndarray,
                               articoli: List[Dict[str, Any]]) -> Tuple[int, np.ndarray]:
    """Sceglie la configurazione migliore basata su:
    1. Silhouette Score (massimizzare)
    2. Distribuzione cluster (nessun cluster > 20%)
    """
    print("\n" + "="*60)
    print("SELEZIONE CONFIGURAZIONE OTTIMALE")
    print("="*60)
    
    # Ordina per silhouette score (decrescente)
    results_sorted = sorted(results, key=lambda x: x[1], reverse=True)
    
    print("\nTop 5 configurazioni per Silhouette Score:")
    for i, (n_clusters, silhouette, _) in enumerate(results_sorted[:5], 1):
        print(f"  {i}. {n_clusters} cluster: Silhouette = {silhouette:.4f}")
    
    # Valuta ogni configurazione per distribuzione
    best_config = None
    best_score = -1
    
    for n_clusters, silhouette, cluster_labels in results_sorted:
        # Calcola distribuzione cluster
        cluster_counts = Counter(cluster_labels)
        max_cluster_pct = max(count / len(cluster_labels) * 100 for count in cluster_counts.values())
        
        # Score combinato: silhouette + penalità per cluster troppo grandi
        if max_cluster_pct > 20:
            penalty = (max_cluster_pct - 20) / 100  # Penalità proporzionale
            combined_score = silhouette - penalty
        else:
            combined_score = silhouette
        
        print(f"\n{n_clusters} cluster:")
        print(f"  Silhouette: {silhouette:.4f}")
        print(f"  Cluster più grande: {max_cluster_pct:.1f}%")
        print(f"  Score combinato: {combined_score:.4f}")
        
        if combined_score > best_score:
            best_score = combined_score
            best_config = (n_clusters, cluster_labels)
    
    if best_config:
        n_clusters, cluster_labels = best_config
        print(f"\n[OK] Configurazione scelta: {n_clusters} cluster")
        
        # Verifica distribuzione finale
        cluster_counts = Counter(cluster_labels)
        max_cluster_pct = max(count / len(cluster_labels) * 100 for count in cluster_counts.values())
        print(f"   Cluster piu grande: {max_cluster_pct:.1f}%")
        
        if max_cluster_pct > 20:
            print(f"   [WARN] Attenzione: cluster piu grande supera il 20%")
        else:
            print(f"   [OK] Tutti i cluster sono sotto il 20%")
        
        return n_clusters, cluster_labels
    else:
        raise ValueError("Nessuna configurazione valida trovata")


def calculate_coherence_scores(cluster_labels: np.ndarray, embeddings: np.ndarray) -> np.ndarray:
    """Calcola score di coerenza basato su distanza dal centroide"""
    print("\nCalcolo score_coerenza...")
    scores = np.zeros(len(cluster_labels), dtype=np.float32)
    unique_labels = np.unique(cluster_labels)
    
    for label in unique_labels:
        mask = cluster_labels == label
        cluster_points = embeddings[mask]
        
        if len(cluster_points) > 1:
            # Calcola centroide
            centroid = np.mean(cluster_points, axis=0)
            
            # Calcola distanze dal centroide
            distances = np.linalg.norm(cluster_points - centroid, axis=1)
            
            # Normalizza: distanza più piccola = score più alto
            if distances.max() > 0:
                normalized = 1.0 - (distances / distances.max())
            else:
                normalized = np.ones(len(distances))
            
            scores[mask] = normalized
        else:
            # Cluster con un solo punto: score massimo
            scores[mask] = 1.0
    
    print(f"[OK] Score coerenza calcolati")
    print(f"   Media: {scores.mean():.4f}")
    print(f"   Min: {scores.min():.4f}")
    print(f"   Max: {scores.max():.4f}")
    
    return scores


def generate_cluster_labels(cluster_labels: np.ndarray, articoli: List[Dict[str, Any]], 
                           themes: List[Dict[str, Any]]) -> Dict[int, str]:
    """Genera label per ogni cluster basandosi su tag/categorie più comuni"""
    print("\nGenerazione label cluster...")
    
    # Raggruppa articoli per cluster
    cluster_articoli = {}
    for idx, label in enumerate(cluster_labels):
        if label not in cluster_articoli:
            cluster_articoli[label] = []
        cluster_articoli[label].append(articoli[idx])
    
    tema_labels = {}
    
    for cluster_id, arts in cluster_articoli.items():
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


def load_themes() -> List[Dict[str, Any]]:
    """Carica i 15 temi del Documento Master"""
    if THEMES_JSON.exists():
        with THEMES_JSON.open('r', encoding='utf-8') as f:
            return json.load(f)
    return []


def map_clusters_to_themes(cluster_labels: np.ndarray, articoli: List[Dict[str, Any]], 
                           themes: List[Dict[str, Any]]) -> Dict[int, Dict[str, Any]]:
    """Mappa i cluster generati ai 15 temi del Documento Master"""
    print("\n" + "="*60)
    print("MAPPA CLUSTER -> TEMI DOCUMENTO MASTER")
    print("="*60)
    
    # Raggruppa articoli per cluster
    cluster_articoli = {}
    for idx, label in enumerate(cluster_labels):
        if label not in cluster_articoli:
            cluster_articoli[label] = []
        cluster_articoli[label].append(articoli[idx])
    
    mapping = {}
    
    for cluster_id, arts in cluster_articoli.items():
        # Analizza contenuto del cluster
        all_tags = []
        all_categories = []
        all_titles = []
        
        for art in arts:
            tags = art.get('tags_slugs', '').split(',') if art.get('tags_slugs') else []
            categories = art.get('categories_slugs', '').split(',') if art.get('categories_slugs') else []
            all_tags.extend([t.strip() for t in tags if t.strip()])
            all_categories.extend([c.strip() for c in categories if c.strip()])
            all_titles.append(art.get('title', ''))
        
        # Filtra categorie "numero-X"
        all_categories = [c for c in all_categories if not c.startswith('numero-')]
        
        # Trova temi più probabili basandosi su keyword matching
        theme_scores = {}
        for theme in themes:
            score = 0
            theme_label_lower = theme['label'].lower()
            theme_cat_lower = theme.get('categoria_menu', '').lower()
            
            # Match su tag
            for tag in all_tags:
                if tag.lower() in theme_label_lower or tag.lower() in theme_cat_lower:
                    score += 2
            
            # Match su categorie
            for cat in all_categories:
                if cat.lower() in theme_label_lower or cat.lower() in theme_cat_lower:
                    score += 1
            
            # Match su definizione
            definition = theme.get('short_definition', '').lower()
            for tag in all_tags:
                if tag.lower() in definition:
                    score += 1
            
            if score > 0:
                theme_scores[theme['id_tema']] = {
                    'theme': theme,
                    'score': score
                }
        
        # Trova tema migliore
        if theme_scores:
            best_theme_id = max(theme_scores.keys(), key=lambda k: theme_scores[k]['score'])
            best_match = theme_scores[best_theme_id]
            mapping[cluster_id] = {
                'id_tema': best_theme_id,
                'label_tema': best_match['theme']['label'],
                'categoria_menu': best_match['theme'].get('categoria_menu', ''),
                'score_match': best_match['score'],
                'size': len(arts)
            }
        else:
            # Nessun match: cluster generico
            mapping[cluster_id] = {
                'id_tema': None,
                'label_tema': f"Cluster {cluster_id} - Da classificare",
                'categoria_menu': 'Altro',
                'score_match': 0,
                'size': len(arts)
            }
    
    return mapping


def create_mappa_temi(articoli: List[Dict[str, Any]], cluster_labels: np.ndarray, 
                      coherence_scores: np.ndarray) -> None:
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


def generate_report(articoli: List[Dict[str, Any]], cluster_labels: np.ndarray, 
                   results: List[Tuple[int, float, np.ndarray]], 
                   best_n: int, theme_mapping: Dict[int, Dict[str, Any]],
                   themes: List[Dict[str, Any]]) -> None:
    """Genera report completo"""
    OUTPUT_REPORT.parent.mkdir(parents=True, exist_ok=True)
    
    cluster_counts = Counter(cluster_labels)
    max_cluster_pct = max(count / len(cluster_labels) * 100 for count in cluster_counts.values())
    
    lines = []
    lines.append("# Report Clustering Gerarchico Agglomerativo")
    lines.append("")
    lines.append(f"**Data:** {time.strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append("")
    lines.append("## Parametri Utilizzati")
    lines.append("")
    lines.append(f"- **Algoritmo:** AgglomerativeClustering")
    lines.append(f"- **Linkage:** {LINKAGE}")
    lines.append(f"- **Metric:** {METRIC}")
    lines.append(f"- **Range testato:** {MIN_CLUSTERS} - {MAX_CLUSTERS} cluster")
    lines.append("")
    lines.append("## Risultati Test Configurazioni")
    lines.append("")
    lines.append("| N Cluster | Silhouette Score |")
    lines.append("|-----------|------------------|")
    for n_clusters, silhouette, _ in sorted(results, key=lambda x: x[0]):
        marker = " ⭐" if n_clusters == best_n else ""
        lines.append(f"| {n_clusters} | {silhouette:.4f}{marker} |")
    lines.append("")
    lines.append("## Configurazione Scelta")
    lines.append("")
    lines.append(f"- **Numero cluster:** {best_n}")
    best_silhouette = next(s for n, s, _ in results if n == best_n)
    lines.append(f"- **Silhouette Score:** {best_silhouette:.4f}")
    lines.append(f"- **Cluster più grande:** {max_cluster_pct:.1f}%")
    lines.append(f"- **Obiettivo:** < 20%")
    lines.append(f"- **Risultato:** {'RAGGIUNTO' if max_cluster_pct < 20 else 'DA OTTIMIZZARE'}")
    lines.append("")
    lines.append("## Distribuzione Cluster")
    lines.append("")
    lines.append("| Cluster ID | Articoli | % | Tema Mappato | Categoria Menu |")
    lines.append("|------------|----------|---|--------------|----------------|")
    
    for cluster_id, count in sorted(cluster_counts.items()):
        pct = (count / len(cluster_labels)) * 100
        mapping = theme_mapping.get(cluster_id, {})
        tema_label = mapping.get('label_tema', f'Cluster {cluster_id}')
        categoria = mapping.get('categoria_menu', '-')
        lines.append(f"| {cluster_id} | {count} | {pct:.1f}% | {tema_label} | {categoria} |")
    
    lines.append("")
    lines.append("## Mappatura Cluster → Temi Documento Master")
    lines.append("")
    lines.append("| Cluster ID | Tema Master | Match Score | Articoli |")
    lines.append("|------------|-------------|-------------|----------|")
    
    for cluster_id in sorted(cluster_counts.keys()):
        mapping = theme_mapping.get(cluster_id, {})
        tema_id = mapping.get('id_tema', '-')
        tema_label = mapping.get('label_tema', f'Cluster {cluster_id}')
        score = mapping.get('score_match', 0)
        size = mapping.get('size', 0)
        lines.append(f"| {cluster_id} | {tema_label} ({tema_id}) | {score} | {size} |")
    
    OUTPUT_REPORT.write_text("\n".join(lines), encoding='utf-8')
    print(f"[OK] Report salvato: {OUTPUT_REPORT}")


def main():
    """Esegue clustering gerarchico completo"""
    print("="*60)
    print("RE-CLUSTERING GERARCHICO AGGLOMERATIVO")
    print("="*60)
    
    # 1. Carica dati
    articoli = load_articoli()
    embeddings = load_embeddings()
    
    if len(articoli) != len(embeddings):
        raise ValueError(f"Numero articoli ({len(articoli)}) != numero embedding ({len(embeddings)})")
    
    # 2. Testa configurazioni
    results = test_clustering_configurations(embeddings, MIN_CLUSTERS, MAX_CLUSTERS)
    
    # 3. Scegli configurazione migliore
    best_n, best_labels = choose_best_configuration(results, embeddings, articoli)
    
    # 4. Calcola score coerenza
    coherence_scores = calculate_coherence_scores(best_labels, embeddings)
    
    # 5. Carica temi e mappa cluster
    themes = load_themes()
    theme_mapping = map_clusters_to_themes(best_labels, articoli, themes)
    
    # 6. Crea mappa temi
    create_mappa_temi(articoli, best_labels, coherence_scores)
    
    # 7. Genera report
    generate_report(articoli, best_labels, results, best_n, theme_mapping, themes)
    
    print("\n" + "="*60)
    print("COMPLETATO!")
    print("="*60)
    print(f"[OK] File principale: {OUTPUT_CSV}")
    print(f"[OK] Report: {OUTPUT_REPORT}")
    
    # Stampa riepilogo mappatura temi
    print("\n" + "="*60)
    print("RIEPILOGO MAPPA CLUSTER -> TEMI")
    print("="*60)
    for cluster_id in sorted(set(best_labels)):
        mapping = theme_mapping.get(cluster_id, {})
        print(f"Cluster {cluster_id}: {mapping.get('label_tema', 'N/A')} ({mapping.get('size', 0)} articoli)")


if __name__ == "__main__":
    main()

