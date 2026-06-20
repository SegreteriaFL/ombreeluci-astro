#!/usr/bin/env python3
"""
scripts/genera_correlati.py

Rigenera src/data/correlati.json dagli embedding originali (3072-dim).

Per ogni articolo IT trova i K vicini più prossimi via cosine similarity
nello spazio embedding completo. Solo articoli IT — le traduzioni EN/ES/FR
risolvono i correlati tramite articolo_traduzione (principio IT-first).

Il dataset di embedding (embeddings_arricchiti.npy) contiene solo articoli IT
(3488, generato prima della traduzione EN). La mappa posizione → slug IT viene
dal correlati.json precedente o da Directus API.

Input:
    scripts_and_data/datasets/articoli/embeddings_arricchiti.npy   (N, 3072)
    src/data/correlati.json  (precedente, per mappa posizione → slug IT)

Output:
    src/data/correlati.json   { slug_it: [slug1..slugK] }

Uso:
    python scripts/genera_correlati.py                  # usa slug da correlati.json esistente
    python scripts/genera_correlati.py --from-directus  # fetch slug da Directus API
"""

import argparse
import json
import os
import ssl
import sys
import urllib.request
import urllib.parse
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "scripts_and_data" / "datasets" / "articoli"
OUT  = ROOT / "src" / "data" / "correlati.json"

N_NEIGHBORS = 30


def fetch_it_slugs_directus() -> dict[int, str]:
    """Fetcha da Directus wp_id -> slug per articoli IT published."""
    url   = os.environ.get("DIRECTUS_URL", "https://cms.ombreeluci.it")
    token = os.environ.get("DIRECTUS_TOKEN", "")
    if not token:
        print("[ERROR] DIRECTUS_TOKEN non impostato")
        sys.exit(1)

    ctx = ssl.create_default_context()
    results = []
    offset  = 0
    while True:
        params = urllib.parse.urlencode({
            "fields": "wp_id,slug",
            "filter[lang][_eq]": "it",
            "filter[stato][_eq]": "published",
            "limit":  500,
            "offset": offset,
        })
        req = urllib.request.Request(
            f"{url}/items/articoli?{params}",
            headers={
                "Authorization": f"Bearer {token}",
                "User-Agent": "oel-genera-correlati/1.0",
            },
        )
        with urllib.request.urlopen(req, timeout=30, context=ctx) as r:
            batch = json.loads(r.read())["data"]
        results.extend(batch)
        print(f"  Fetched {len(results)} articoli IT...", end="\r")
        if len(batch) < 500:
            break
        offset += 500

    print(f"  Fetched {len(results)} articoli IT published")
    return {a["wp_id"]: a["slug"] for a in results if a.get("wp_id") and a.get("slug")}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--from-directus", action="store_true",
                        help="Fetch slug da Directus API invece che dal correlati.json esistente")
    args = parser.parse_args()

    # ── Carica embedding originali (3072-dim, solo IT) ────────────────────────
    emb: np.ndarray = np.load(DATA / "embeddings_arricchiti.npy")
    N = emb.shape[0]
    print(f"Embedding: {N} articoli  |  {emb.shape[1]} dimensioni")

    # ── Recupera mappa posizione → slug IT ────────────────────────────────────
    if args.from_directus:
        print("Fetch slug IT da Directus...")
        with open(DATA / "articoli_semantici_FULL_2026.json", encoding="utf-8") as f:
            sem = json.load(f)
        assert len(sem) == N, f"Mismatch: sem={len(sem)}, emb={N}"
        wpid_to_slug = fetch_it_slugs_directus()
        slugs = [wpid_to_slug.get(art["id"]) for art in sem]
        valid = sum(1 for s in slugs if s)
        print(f"Slug IT validi: {valid}  |  Senza slug: {N - valid}")
    else:
        print("Slug IT da correlati.json esistente...")
        with open(OUT, encoding="utf-8") as f:
            old = json.load(f)
        slugs = list(old.keys())
        assert len(slugs) == N, f"Mismatch: correlati={len(slugs)}, emb={N}"
        print(f"Slug IT: {len(slugs)}")

    # ── Indici con slug valido ────────────────────────────────────────────────
    valid_idx = [i for i, s in enumerate(slugs) if s]
    print(f"Articoli con slug valido: {len(valid_idx)}")

    # ── Normalizza per cosine similarity ──────────────────────────────────────
    norms = np.linalg.norm(emb, axis=1, keepdims=True)
    norms[norms == 0] = 1
    emb_n = emb / norms

    # ── Matrice cosine similarity ─────────────────────────────────────────────
    print(f"Calcolo cosine similarity {N}x{N}...")
    sim = emb_n @ emb_n.T
    np.fill_diagonal(sim, -1)

    # ── Top-K per ogni articolo ───────────────────────────────────────────────
    print(f"Estrazione top-{N_NEIGHBORS}...")
    correlati: dict[str, list[str]] = {}

    for i in valid_idx:
        row = sim[i].copy()
        # Azzera posizioni senza slug (non dovrebbero esserci ma per sicurezza)
        for j in range(N):
            if j not in valid_idx:
                row[j] = -2
        top_k = np.argsort(row)[-N_NEIGHBORS:][::-1]
        correlati[slugs[i]] = [slugs[j] for j in top_k]

    print(f"Correlati generati: {len(correlati)}")
    avg = sum(len(v) for v in correlati.values()) / len(correlati)
    print(f"Media vicini per articolo: {avg:.1f}")

    # ── Scrivi output ─────────────────────────────────────────────────────────
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(correlati, f, ensure_ascii=False, separators=(",", ":"))

    size_kb = OUT.stat().st_size / 1024
    print(f"\nScritto: {OUT}  ({size_kb:.0f} KB)")


if __name__ == "__main__":
    main()
