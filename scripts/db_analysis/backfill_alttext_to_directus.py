"""
backfill_alttext_to_directus.py

Legge scripts/db_analysis/logs/alttext_generation.json (fileId -> alt_text)
e patcha il campo `description` su ogni file in Directus (/files/{id}).

Esegui DOPO che alttext_generation.json è completo.

Uso:
    python scripts/db_analysis/backfill_alttext_to_directus.py
    python scripts/db_analysis/backfill_alttext_to_directus.py --dry-run
"""

import json
import os
import sys
import time
import argparse
import urllib.request
import urllib.error
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────

DIRECTUS_URL = os.environ.get('DIRECTUS_URL', 'http://159.69.196.64:8055')
DIRECTUS_TOKEN = os.environ.get('DIRECTUS_TOKEN', 'nBZ6kdd0YgVnhLm2TZEDoT9A-NJujwVU')

ALTTEXT_LOG = Path('scripts/db_analysis/logs/alttext_generation.json')
BACKFILL_LOG = Path('scripts/db_analysis/logs/backfill_alttext_to_directus.csv')

DELAY_S = 0.15          # pausa tra PATCH (no rate limit su Directus locale)
BATCH_LOG_EVERY = 50    # stampa progresso ogni N

# ── Helpers ───────────────────────────────────────────────────────────────────

def directus_patch(file_id: str, description: str, dry_run: bool) -> str:
    """PATCH /files/{id} con campo description. Ritorna 'ok'/'skip'/'error:...'"""
    if dry_run:
        return 'dry-run'
    url = f'{DIRECTUS_URL}/files/{file_id}'
    body = json.dumps({'description': description}).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=body,
        method='PATCH',
        headers={
            'Authorization': f'Bearer {DIRECTUS_TOKEN}',
            'Content-Type': 'application/json',
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            r.read()
            return 'ok'
    except urllib.error.HTTPError as e:
        return f'error:{e.code} {e.reason}'
    except Exception as e:
        return f'error:{e}'


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true', help='Non scrive su Directus')
    args = parser.parse_args()

    sys.stdout.reconfigure(encoding='utf-8')

    if not ALTTEXT_LOG.exists():
        print(f'ERRORE: {ALTTEXT_LOG} non trovato', file=sys.stderr)
        sys.exit(1)

    with open(ALTTEXT_LOG, encoding='utf-8') as f:
        alttext: dict[str, str] = json.load(f)

    total = len(alttext)
    print(f'Alt text da backfillare: {total}')
    if args.dry_run:
        print('[DRY-RUN] nessuna modifica su Directus')

    # Carica log precedente per riprendere
    already_done: set[str] = set()
    if BACKFILL_LOG.exists():
        with open(BACKFILL_LOG, encoding='utf-8') as f:
            for line in f:
                parts = line.strip().split(',', 1)
                if parts and parts[0] and parts[0] != 'file_id':
                    already_done.add(parts[0])
        print(f'Già patchati (da log precedente): {len(already_done)}')

    # Apri CSV in append
    write_header = not BACKFILL_LOG.exists()
    log_fh = open(BACKFILL_LOG, 'a', encoding='utf-8', newline='')
    if write_header:
        log_fh.write('file_id,status\n')
        log_fh.flush()

    ok = err = skip = 0
    todo = {k: v for k, v in alttext.items() if k not in already_done}
    print(f'Da processare ora: {len(todo)}')
    print()

    for i, (file_id, description) in enumerate(todo.items(), 1):
        if not description or not description.strip():
            status = 'skip:empty'
            skip += 1
        else:
            status = directus_patch(file_id, description.strip(), args.dry_run)
            if status in ('ok', 'dry-run'):
                ok += 1
            else:
                err += 1

        log_fh.write(f'{file_id},{status}\n')
        if i % 10 == 0:
            log_fh.flush()

        if i % BATCH_LOG_EVERY == 0 or i == len(todo):
            print(f'[{i}/{len(todo)}] ok={ok} err={err} skip={skip}')

        if not args.dry_run:
            time.sleep(DELAY_S)

    log_fh.close()
    print()
    print(f'Completato — ok={ok}, err={err}, skip={skip}')
    print(f'Log: {BACKFILL_LOG}')


if __name__ == '__main__':
    main()
