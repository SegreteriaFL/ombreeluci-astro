# Report Clustering con Testo Arricchito

**Data:** 2026-01-31 10:36:38

## Parametri Utilizzati

### UMAP
```python
{
  "n_neighbors": 12,
  "n_components": 3,
  "min_dist": 0.08,
  "metric": "cosine",
  "random_state": 42,
  "spread": 1.3
}
```

### HDBSCAN
```python
{
  "min_cluster_size": 4,
  "min_samples": 2,
  "cluster_selection_epsilon": 0.15,
  "cluster_selection_method": "eom",
  "metric": "euclidean",
  "core_dist_n_jobs": -1,
  "prediction_data": true
}
```

## Risultati

- **Totale articoli:** 3488
- **Numero cluster:** 21
- **Cluster 0 (outlier):** 3 articoli (0.1%)
- **Obiettivo:** < 40%
- **Risultato:** ✅ RAGGIUNTO

## Distribuzione Cluster

| Cluster ID | Label Tematico | Articoli | % |
|------------|----------------|----------|---|
| -1 | Cluster 0 - Da analizzare | 3 | 0.1% |
| 0 | testimonianze - fede-e-luce | 2931 | 84.0% |
| 1 | jean-vanier - jean-vanier | 96 | 2.8% |
| 2 | Categoria: ombre-e-luci-sfogliabile | 19 | 0.5% |
| 3 | diario-di-giovanni - persone-con-disabilita | 25 | 0.7% |
| 4 | viola-e-mimosa - amicizia | 17 | 0.5% |
| 5 | editoriali - natale | 42 | 1.2% |
| 6 | recensioni - martini | 14 | 0.4% |
| 7 | n-63 - comunicazione-facilitata | 7 | 0.2% |
| 8 | n-107 - scout | 8 | 0.2% |
| 9 | testimonianze - persone-con-disabilita | 6 | 0.2% |
| 10 | cinema-e-disabilita - cinema-e-disabilita | 171 | 4.9% |
| 11 | affettivita - amore-e-disabilita | 18 | 0.5% |
| 12 | Categoria: recensioni | 2 | 0.1% |
| 13 | n-96 - alzheimer | 9 | 0.3% |
| 14 | diario-di-benedetta - festa | 92 | 2.6% |
| 15 | archivi - natale | 2 | 0.1% |
| 16 | Categoria: testimonianze | 7 | 0.2% |
| 17 | n-97 - adhd | 6 | 0.2% |
| 18 | n-127 - ironia-e-disabilita | 5 | 0.1% |
| 19 | diario-di-davide - podcast | 6 | 0.2% |
| 20 | Categoria: diario-di-luciana | 2 | 0.1% |