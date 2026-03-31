#!/usr/bin/env python3
"""
scripts/genera_correlati.py

Rigenera src/data/correlati.json dai dati UMAP precomputati.

Per ogni articolo trova i 5 vicini più prossimi nello spazio UMAP 3D
(distanza euclidea). Esclude articoli senza slug e autoloop.

Input:
    scripts_and_data/datasets/articoli/umap_coordinates.npy   (N, 3)
    scripts_and_data/datasets/articoli/articoli_semantici_FULL_2026.json
    scripts_and_data/datasets/articoli/articoli_slugs_definitivi.json

Output:
    src/data/correlati.json   { slug: [slug1..slug5] }

Uso:
    python scripts/genera_correlati.py
"""

import json
import os
import sys
import urllib.request
import urllib.parse
from pathlib import Path

import numpy as np

ROOT    = Path(__file__).resolve().parent.parent
DATA    = ROOT / "scripts_and_data" / "datasets" / "articoli"
OUT     = ROOT / "src" / "data" / "correlati.json"

DIRECTUS_URL   = os.environ.get("DIRECTUS_URL",   "http://159.69.196.64:8055")
DIRECTUS_TOKEN = os.environ.get("DIRECTUS_TOKEN", "nBZ6kdd0YgVnhLm2TZEDoT9A-NJujwVU")

N_NEIGHBORS = 5


def fetch_wpid_to_slug() -> dict[int, str]:
    """Fetcha da Directus la mappa wp_id -> slug per tutti gli articoli."""
    results = []
    offset  = 0
    while True:
        params = urllib.parse.urlencode({
            "fields": "wp_id,slug",
            "limit":  500,
            "offset": offset,
        })
        req = urllib.request.Request(
            f"{DIRECTUS_URL}/items/articoli?{params}",
            headers={"Authorization": f"Bearer {DIRECTUS_TOKEN}"},
        )
        with urllib.request.urlopen(req, timeout=30) as r:
            batch = json.loads(r.read())["data"]
        results.extend(batch)
        if len(batch) < 500:
            break
        offset += 500
    return {a["wp_id"]: a["slug"] for a in results if a.get("wp_id") and a.get("slug")}


def main():
    # ── Carica dati ────────────────────────────────────────────────────────────
    umap: np.ndarray = np.load(DATA / "umap_coordinates.npy")          # (N, 3)
    with open(DATA / "articoli_semantici_FULL_2026.json", encoding="utf-8") as f:
        sem = json.load(f)   # list of {id: wp_id, ...}

    N = len(sem)
    assert umap.shape[0] == N, f"Mismatch: umap={umap.shape[0]}, sem={N}"
    print(f"Articoli nel dataset UMAP: {N}  |  shape: {umap.shape}")

    # ── Fetch slug attuali da Directus (wp_id -> slug) ────────────────────────
    print("Fetch wp_id->slug da Directus...")
    wpid_to_slug = fetch_wpid_to_slug()
    print(f"Slug in Directus: {len(wpid_to_slug)}")

    # ── Costruisci indice: posizione → slug Directus ──────────────────────────
    idx_to_slug: list[str | None] = []
    for art in sem:
        wp_id = art["id"]
        slug  = wpid_to_slug.get(wp_id)
        idx_to_slug.append(slug)

    valid = sum(1 for s in idx_to_slug if s)
    print(f"Posizioni con slug Directus valido: {valid}  |  Senza: {N - valid}")

    valid = sum(1 for s in idx_to_slug if s)
    print(f"Con slug valido: {valid}  |  Senza slug (saltati): {N - valid}")

    # ── Nearest neighbors via distanza euclidea ───────────────────────────────
    # Usiamo numpy puro: per N=3488 è O(N²) ma istantaneo (~50ms)
    correlati: dict[str, list[str]] = {}

    for i, slug in enumerate(idx_to_slug):
        if not slug:
            continue

        diff  = umap - umap[i]               # (N, 3)
        dists = np.einsum("ij,ij->i", diff, diff)  # squared euclidean, faster than linalg
        dists[i] = np.inf                     # escludi se stesso

        # Prendi i N_NEIGHBORS più vicini
        nn_idx = np.argpartition(dists, N_NEIGHBORS)[:N_NEIGHBORS]
        nn_idx = nn_idx[np.argsort(dists[nn_idx])]   # ordina per distanza

        neighbors = []
        for j in nn_idx:
            s = idx_to_slug[j]
            if s:
                neighbors.append(s)

        correlati[slug] = neighbors

    print(f"Correlati generati: {len(correlati)}")
    avg = sum(len(v) for v in correlati.values()) / len(correlati)
    print(f"Media vicini per articolo: {avg:.2f}")

    # ── Scrivi output ─────────────────────────────────────────────────────────
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(correlati, f, ensure_ascii=False, separators=(",", ":"))

    size_kb = OUT.stat().st_size / 1024
    print(f"\nScritto: {OUT}  ({size_kb:.0f} KB)")


if __name__ == "__main__":
    main()
