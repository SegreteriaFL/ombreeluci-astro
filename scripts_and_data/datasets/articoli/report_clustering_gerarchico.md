# Report Clustering Gerarchico Agglomerativo

**Data:** 2026-01-31 11:35:00

## Parametri Utilizzati

- **Algoritmo:** AgglomerativeClustering
- **Linkage:** ward
- **Metric:** euclidean
- **Range testato:** 15 - 25 cluster

## Risultati Test Configurazioni

| N Cluster | Silhouette Score |
|-----------|------------------|
| 15 | 0.0287 ⭐ |
| 16 | 0.0281 |
| 17 | 0.0238 |
| 18 | 0.0251 |
| 19 | 0.0235 |
| 20 | 0.0209 |
| 21 | 0.0241 |
| 22 | 0.0238 |
| 23 | 0.0132 |
| 24 | 0.0151 |
| 25 | 0.0146 |

## Configurazione Scelta

- **Numero cluster:** 15
- **Silhouette Score:** 0.0287
- **Cluster più grande:** 13.6%
- **Obiettivo:** < 20%
- **Risultato:** RAGGIUNTO

## Distribuzione Cluster

| Cluster ID | Articoli | % | Tema Mappato | Categoria Menu |
|------------|----------|---|--------------|----------------|
| 0 | 448 | 12.8% | Educare e crescere insieme | Crescere |
| 1 | 357 | 10.2% | Educare e crescere insieme | Crescere |
| 2 | 211 | 6.0% | Educare e crescere insieme | Crescere |
| 3 | 209 | 6.0% | Comunità, accoglienza e inclusione | Comunità |
| 4 | 59 | 1.7% | Cluster 4 - Da classificare | Altro |
| 5 | 388 | 11.1% | Educare e crescere insieme | Crescere |
| 6 | 474 | 13.6% | Educare e crescere insieme | Crescere |
| 7 | 86 | 2.5% | Cluster 7 - Da classificare | Altro |
| 8 | 91 | 2.6% | Educare e crescere insieme | Crescere |
| 9 | 157 | 4.5% | Cinema e disabilità | Cultura |
| 10 | 132 | 3.8% | Educare e crescere insieme | Crescere |
| 11 | 113 | 3.2% | Comunità, accoglienza e inclusione | Comunità |
| 12 | 231 | 6.6% | Educare e crescere insieme | Crescere |
| 13 | 102 | 2.9% | Diritti, cittadinanza e società | Diritti |
| 14 | 430 | 12.3% | Famiglie, genitori, fratelli | Famiglie |

## Mappatura Cluster → Temi Documento Master

| Cluster ID | Tema Master | Match Score | Articoli |
|------------|-------------|-------------|----------|
| 0 | Educare e crescere insieme (T10) | 31 | 448 |
| 1 | Educare e crescere insieme (T10) | 49 | 357 |
| 2 | Educare e crescere insieme (T10) | 60 | 211 |
| 3 | Comunità, accoglienza e inclusione (T04) | 19 | 209 |
| 4 | Cluster 4 - Da classificare (None) | 0 | 59 |
| 5 | Educare e crescere insieme (T10) | 100 | 388 |
| 6 | Educare e crescere insieme (T10) | 15 | 474 |
| 7 | Cluster 7 - Da classificare (None) | 0 | 86 |
| 8 | Educare e crescere insieme (T10) | 6 | 91 |
| 9 | Cinema e disabilità (T14) | 6 | 157 |
| 10 | Educare e crescere insieme (T10) | 70 | 132 |
| 11 | Comunità, accoglienza e inclusione (T04) | 5 | 113 |
| 12 | Educare e crescere insieme (T10) | 22 | 231 |
| 13 | Diritti, cittadinanza e società (T08) | 27 | 102 |
| 14 | Famiglie, genitori, fratelli (T02) | 95 | 430 |