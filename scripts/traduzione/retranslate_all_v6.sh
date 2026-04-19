#!/usr/bin/env bash
# retranslate_all_v6.sh — Rollback di tutti i vecchi batch + ritraduzione completa con prompt v6
# Uso: bash retranslate_all_v6.sh

set -e

export DIRECTUS_TOKEN="uVlgDIPkUPFofSFAx0VjR7Ag9wHHjMBL"
export DIRECTUS_URL="https://cms.ombreeluci.it"
export ANTHROPIC_API_KEY="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"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== FASE 1: Rollback vecchi batch ==="
for JOB in pilot-20260418 batch-20260418 batch-20260418-1k batch-20260418-rest batch-20260418-v3; do
    echo "  Rollback: $JOB"
    python "$SCRIPT_DIR/rollback_batch.py" --job-id "$JOB" || echo "  WARN: rollback $JOB fallito (forse già rimosso)"
done

echo ""
echo "=== FASE 2: Ritraduzione completa con prompt v6 ==="
python "$SCRIPT_DIR/translate_articles.py" \
    --stato published \
    --workers 2 \
    --min-tokens 0 \
    --job-id retranslate-v6

echo ""
echo "=== COMPLETATO ==="
