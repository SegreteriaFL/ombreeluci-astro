#!/usr/bin/env python3
"""
Normalizza il campo slug della collection autori in Directus.
Per ogni autore con slug != slug_normalizzato(nome_completo):
  PATCH /items/autori/{id}  { slug: <slug_normalizzato> }
"""
import re
import unicodedata
import json
import urllib.request
import urllib.parse
import time
import os

DIRECTUS_URL = os.environ.get("DIRECTUS_URL", "http://159.69.196.64:8055")
DIRECTUS_TOKEN = os.environ.get("DIRECTUS_TOKEN", "b9e3c6d1e2748f890ccd4d84453bbdc094909fd9bda4e81b3c81821116a1757e")
DRY_RUN = os.environ.get("DRY_RUN", "0") == "1"

def to_slug(name: str) -> str:
    name = unicodedata.normalize("NFD", name)
    name = "".join(c for c in name if unicodedata.category(c) != "Mn")
    name = name.lower()
    name = re.sub(r"[^a-z0-9]+", "-", name)
    name = name.strip("-")
    return name

def api_get(path):
    url = f"{DIRECTUS_URL}{path}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {DIRECTUS_TOKEN}"})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def api_patch(path, data):
    url = f"{DIRECTUS_URL}{path}"
    body = json.dumps(data).encode()
    req = urllib.request.Request(url, data=body, method="PATCH",
        headers={"Authorization": f"Bearer {DIRECTUS_TOKEN}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

# Carica tutti gli autori
params = urllib.parse.urlencode({"fields": "id,slug,nome_completo", "limit": "-1"})
data = api_get(f"/items/autori?{params}")
autori = data["data"]
print(f"Totale autori: {len(autori)}")

to_fix = []
for a in autori:
    expected = to_slug(a["nome_completo"])
    if a["slug"] != expected:
        to_fix.append({"id": a["id"], "slug_attuale": a["slug"],
                        "nome_completo": a["nome_completo"], "slug_nuovo": expected})

print(f"Da aggiornare: {len(to_fix)}")
if DRY_RUN:
    print("[DRY RUN] Primi 20:")
    for x in to_fix[:20]:
        print(f"  {x['slug_attuale']!r} -> {x['slug_nuovo']!r}  ({x['nome_completo']})")
    exit(0)

ok = err = 0
for x in to_fix:
    try:
        api_patch(f"/items/autori/{x['id']}", {"slug": x["slug_nuovo"]})
        ok += 1
        if ok % 50 == 0:
            print(f"  {ok}/{len(to_fix)} aggiornati...")
        time.sleep(0.05)
    except Exception as e:
        err += 1
        print(f"  ERRORE {x['id']} {x['nome_completo']}: {e}")

print(f"\nFatto: {ok} OK, {err} errori")
