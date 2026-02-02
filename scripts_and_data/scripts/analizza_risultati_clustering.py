#!/usr/bin/env python3
"""Analizza risultati clustering"""
import csv
from collections import Counter

with open('datasets/articoli/mappa_temi_definitiva.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    clusters = Counter()
    for row in reader:
        clusters[row['nuovo_cluster_id']] += 1

total = sum(clusters.values())
print(f"Total records: {total}")
print(f"Unique clusters: {len(clusters)}")
print(f"\nCluster 0 size: {clusters['0']} ({clusters['0']/total*100:.1f}%)")
print(f"Outliers (-1): {clusters.get('-1', 0)}")
print(f"\nTop 15 clusters:")
for cluster_id, count in clusters.most_common(15):
    print(f"  Cluster {cluster_id}: {count} ({count/total*100:.1f}%)")

