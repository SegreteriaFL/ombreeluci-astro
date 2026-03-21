#!/usr/bin/env bash
# test_import.sh — Test minimali per import_to_directus.py
#
# Uso:
#   bash scripts/db_analysis/test_import.sh
#
# Prerequisiti:
#   - DIRECTUS_URL e DIRECTUS_TOKEN impostati (o file .env)
#   - pip install requests tqdm python-dotenv
#   - Directus raggiungibile

set -euo pipefail
cd "$(dirname "$0")/../.."  # root del repo

DIRECTUS_URL="${DIRECTUS_URL:-http://159.69.196.64:8055}"
DIRECTUS_TOKEN="${DIRECTUS_TOKEN:-b9e3c6d1e2748f890ccd4d84453bbdc094909fd9bda4e81b3c81821116a1757e}"
SCRIPT="scripts/db_analysis/import_to_directus.py"

pass=0
fail=0

check() {
    local label="$1"
    local result="$2"
    if [ "$result" = "ok" ]; then
        echo "  [PASS] $label"
        ((pass++))
    else
        echo "  [FAIL] $label — $result"
        ((fail++))
    fi
}

echo "================================================"
echo "TEST: import_to_directus.py"
echo "================================================"

# ── T1: Script esiste ed è importabile ───────────────────────────────────────
echo ""
echo "T1 — Sintassi e import"
if python3 -c "import py_compile; py_compile.compile('$SCRIPT', doraise=True)" 2>/dev/null; then
    check "Sintassi Python valida" "ok"
else
    check "Sintassi Python valida" "compile error"
fi

# ── T2: Dipendenze Python ────────────────────────────────────────────────────
echo ""
echo "T2 — Dipendenze"
for pkg in requests tqdm dotenv; do
    if python3 -c "import $pkg" 2>/dev/null; then
        check "import $pkg" "ok"
    else
        check "import $pkg" "MANCANTE — pip install $pkg"
    fi
done

# ── T3: File sorgente esistono ───────────────────────────────────────────────
echo ""
echo "T3 — File sorgente"
for f in \
    "scripts/db_analysis/output/categorie_wp.json" \
    "scripts/db_analysis/output/tag_wp.json" \
    "scripts/db_analysis/output/autori_wp.json" \
    "scripts/db_analysis/output/numeri_rivista_wp.json" \
    "scripts/db_analysis/output/articoli_wp_puliti.json" \
    "src/data/articoli_megacluster.json"; do
    if [ -f "$f" ]; then
        check "$f" "ok"
    else
        check "$f" "FILE NON TROVATO"
    fi
done

# ── T4: Directus raggiungibile ───────────────────────────────────────────────
echo ""
echo "T4 — Directus health"
HEALTH=$(curl -s "${DIRECTUS_URL}/server/health" 2>/dev/null || echo "unreachable")
if echo "$HEALTH" | grep -q '"ok"'; then
    check "Directus health endpoint" "ok"
else
    check "Directus health endpoint" "UNREACHABLE o error: $HEALTH"
fi

# ── T5: Token valido ─────────────────────────────────────────────────────────
echo ""
echo "T5 — Token API"
TOKEN_CHECK=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer ${DIRECTUS_TOKEN}" \
    "${DIRECTUS_URL}/users/me" 2>/dev/null || echo "000")
if [ "$TOKEN_CHECK" = "200" ]; then
    check "Token API valido" "ok"
else
    check "Token API valido" "HTTP $TOKEN_CHECK"
fi

# ── T6: Dry-run globale ──────────────────────────────────────────────────────
echo ""
echo "T6 — Dry-run globale (nessuna scrittura)"
if DIRECTUS_TOKEN="$DIRECTUS_TOKEN" \
   python3 "$SCRIPT" --dry-run 2>&1 | grep -q "DRY-RUN SUMMARY"; then
    check "Dry-run --all completato" "ok"
else
    check "Dry-run --all completato" "output inatteso"
fi

# ── T7: Dry-run per singola collection ───────────────────────────────────────
echo ""
echo "T7 — Dry-run per collection"
for coll in temi tags autori numeri_rivista articoli; do
    if DIRECTUS_TOKEN="$DIRECTUS_TOKEN" \
       python3 "$SCRIPT" --collection "$coll" --dry-run 2>&1 | grep -qiE "(DRY-RUN|record da importare)"; then
        check "dry-run --collection $coll" "ok"
    else
        check "dry-run --collection $coll" "output inatteso"
    fi
done

# ── T8: Logica derive_id_numero ──────────────────────────────────────────────
echo ""
echo "T8 — Logica derive_id_numero_and_tipo"
RESULT=$(python3 -c "
import sys; sys.path.insert(0, 'scripts/db_analysis')
from import_to_directus import derive_id_numero_and_tipo
counter = {}
cases = [
    ('numero-20-e-il-padre',               'OEL-20', 'oel'),
    ('numero-172-inclusione',              'OEL-172', 'oel'),
    ('insieme-n-10-bollettino-fede-e-luce', 'INS-10', 'ins'),
    ('insieme-n-3',                        'INS-3',  'ins'),
]
ok = True
for slug, expected_id, expected_tipo in cases:
    id_n, tipo = derive_id_numero_and_tipo(slug, counter)
    if id_n != expected_id or tipo != expected_tipo:
        print(f'FAIL {slug}: got {id_n}/{tipo}, expected {expected_id}/{expected_tipo}')
        ok = False
if ok:
    print('all ok')
" 2>&1)
if echo "$RESULT" | grep -q "all ok"; then
    check "derive_id_numero_and_tipo" "ok"
else
    check "derive_id_numero_and_tipo" "$RESULT"
fi

# ── T9: Collections esistono in Directus ─────────────────────────────────────
echo ""
echo "T9 — Collections Directus esistenti"
COLLS=$(curl -s \
    -H "Authorization: Bearer ${DIRECTUS_TOKEN}" \
    "${DIRECTUS_URL}/collections" 2>/dev/null | \
    python3 -c "import json,sys; d=json.load(sys.stdin); print(' '.join(c['collection'] for c in d.get('data',[])))" 2>/dev/null || echo "")

for coll in temi tags autori numeri_rivista articoli serie; do
    if echo "$COLLS" | grep -qw "$coll"; then
        check "collection $coll presente" "ok"
    else
        check "collection $coll presente" "MANCANTE"
    fi
done

# ── Riepilogo ────────────────────────────────────────────────────────────────
echo ""
echo "================================================"
echo "RISULTATO: $pass PASS, $fail FAIL"
echo "================================================"
[ "$fail" -eq 0 ] && exit 0 || exit 1
