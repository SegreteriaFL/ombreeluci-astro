#!/usr/bin/env python3
"""
estimate_tokens.py — Stima il costo della traduzione PRIMA di spendere nulla.

Legge l'intero corpus IT senza traduzione EN da Directus,
conta i token e stampa il costo stimato in €.

Uso:
    export DIRECTUS_TOKEN=xxx
    python estimate_tokens.py
"""

import os
import sys
import json
import math
import urllib.request
import urllib.parse

DIRECTUS_URL = os.environ.get("DIRECTUS_URL", "https://cms.ombreeluci.it")
DIRECTUS_TOKEN = os.environ.get("DIRECTUS_TOKEN", "")

# Pricing Claude Haiku claude-haiku-4-5-20251001 (USD per token)
PRICE_INPUT_PER_TOKEN = 0.80 / 1_000_000
PRICE_OUTPUT_PER_TOKEN = 4.00 / 1_000_000

SYSTEM_PROMPT_TOKENS = 450  # System prompt fisso
METADATA_TOKENS_EST = 150   # titolo + sottotitolo + seo (input)
METADATA_OUTPUT_EST = 120   # stesso, output
RETRY_BUFFER = 1.05         # 5% buffer per retry

EUR_USD_RATE = 0.92         # approssimativo

def directus_get(path: str) -> dict:
    url = f"{DIRECTUS_URL}{path}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {DIRECTUS_TOKEN}"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def estimate_tokens_from_text(text: str) -> int:
    """Approssimazione: ~1 token ogni 4 caratteri (italiano/HTML)."""
    if not text:
        return 0
    return max(1, len(text) // 4)

def main():
    if not DIRECTUS_TOKEN:
        print("ERROR: DIRECTUS_TOKEN non impostato.", file=sys.stderr)
        sys.exit(1)

    print("Carico articoli IT senza traduzione EN da Directus...")

    # Pagina per pagina (limit 100)
    articles = []
    page = 1
    limit = 100
    fields = "id,slug,titolo,sottotitolo,seo_description,corpo"

    while True:
        params = urllib.parse.urlencode({
            "filter[lang][_eq]": "it",
            "filter[stato][_eq]": "published",
            "filter[articolo_traduzione][_null]": "true",
            "fields": fields,
            "limit": limit,
            "page": page,
        })
        data = directus_get(f"/items/articoli?{params}")
        batch = data.get("data", [])
        if not batch:
            break
        articles.extend(batch)
        print(f"  Caricati {len(articles)} articoli...", end="\r")
        if len(batch) < limit:
            break
        page += 1

    print(f"\nArticoli da tradurre: {len(articles)}")

    if not articles:
        print("Nessun articolo da tradurre. Verifica filtri o token.")
        sys.exit(0)

    # Calcola token
    total_input_tokens = 0
    total_output_tokens = 0
    lengths = []

    for a in articles:
        corpo = a.get("corpo") or ""
        corpo_tokens = estimate_tokens_from_text(corpo)
        lengths.append(corpo_tokens)

        input_tok = SYSTEM_PROMPT_TOKENS + METADATA_TOKENS_EST + corpo_tokens
        output_tok = METADATA_OUTPUT_EST + int(corpo_tokens * 0.95)  # EN leggermente più corto

        total_input_tokens += input_tok
        total_output_tokens += output_tok

    # Applica buffer retry
    total_input_tokens = int(total_input_tokens * RETRY_BUFFER)
    total_output_tokens = int(total_output_tokens * RETRY_BUFFER)

    # Costo
    cost_usd = (total_input_tokens * PRICE_INPUT_PER_TOKEN +
                total_output_tokens * PRICE_OUTPUT_PER_TOKEN)
    cost_eur = cost_usd / EUR_USD_RATE

    # Statistiche lunghezza
    lengths.sort()
    p25 = lengths[len(lengths) // 4]
    p50 = lengths[len(lengths) // 2]
    p75 = lengths[len(lengths) * 3 // 4]
    p95 = lengths[int(len(lengths) * 0.95)]
    avg = sum(lengths) // len(lengths)

    print()
    print("=" * 50)
    print("STIMA COSTI TRADUZIONE")
    print("=" * 50)
    print(f"Articoli da tradurre:      {len(articles):>8,}")
    print(f"Token input totali:        {total_input_tokens:>8,}")
    print(f"Token output totali:       {total_output_tokens:>8,}")
    print(f"Costo stimato (USD):       ${cost_usd:>7.2f}")
    print(f"Costo stimato (EUR):       €{cost_eur:>7.2f}")
    print()
    print("Distribuzione lunghezza corpo (token):")
    print(f"  Media:   {avg:>5}")
    print(f"  P25:     {p25:>5}")
    print(f"  P50:     {p50:>5}  (mediana)")
    print(f"  P75:     {p75:>5}")
    print(f"  P95:     {p95:>5}")
    print()

    # Stima tempi con workers diversi
    secs_per_article = 2.5
    for workers in [1, 5, 10]:
        secs = math.ceil(len(articles) * secs_per_article / workers)
        mins = secs // 60
        print(f"  Tempo stimato con {workers:>2} worker: ~{mins} min")

    print()
    print("Modello: claude-haiku-4-5-20251001")
    print("(+5% buffer retry incluso nel calcolo)")

if __name__ == "__main__":
    main()
