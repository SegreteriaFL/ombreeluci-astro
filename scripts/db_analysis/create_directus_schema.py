#!/usr/bin/env python3
"""
Crea lo schema Directus per OEL via API REST.

Uso:
  python3 create_directus_schema.py            # dry-run (default)
  python3 create_directus_schema.py --apply    # applica realmente
"""

import sys
import json
import argparse
import requests

DIRECTUS_URL = "http://159.69.196.64:8055"
ADMIN_EMAIL  = "info@fedeeluce.it"
ADMIN_PASS   = "54f2a7c685950dd9dc7db7e38f7340b8"
STATIC_TOKEN = "b9e3c6d1e2748f890ccd4d84453bbdc094909fd9bda4e81b3c81821116a1757e"


# ─────────────────────────────────────────────────────────────────────────────
# Schema definition
# ─────────────────────────────────────────────────────────────────────────────

COLLECTIONS = [
    {
        "collection": "autori",
        "meta": {"icon": "person", "note": "Autori degli articoli OEL"},
        "schema": {},
        "fields": [
            {"field": "id",                "type": "uuid",    "meta": {"required": True},  "schema": {"is_primary_key": True, "has_auto_increment": False}},
            {"field": "slug",              "type": "string",  "meta": {"required": True},  "schema": {"is_unique": True, "is_nullable": False}},
            {"field": "nome_completo",     "type": "string",  "meta": {"required": True},  "schema": {"is_nullable": False}},
            {"field": "nome_normalizzato", "type": "string",  "meta": {},                  "schema": {}},
            {"field": "bio_html",          "type": "text",    "meta": {},                  "schema": {}},
            {"field": "email",             "type": "string",  "meta": {},                  "schema": {}},
            {"field": "url_wp",            "type": "string",  "meta": {},                  "schema": {}},
            {"field": "articoli_count",    "type": "integer", "meta": {},                  "schema": {}},
            {"field": "articoli_it_count", "type": "integer", "meta": {},                  "schema": {}},
            {"field": "articoli_en_count", "type": "integer", "meta": {},                  "schema": {}},
            # foto → M2O directus_files (aggiunto dopo come relazione)
        ],
    },
    {
        "collection": "numeri_rivista",
        "meta": {"icon": "menu_book", "note": "Numeri della rivista Ombre e Luci / Inserti"},
        "schema": {},
        "fields": [
            {"field": "id",                  "type": "uuid",    "meta": {"required": True}, "schema": {"is_primary_key": True, "has_auto_increment": False}},
            {"field": "id_numero",           "type": "string",  "meta": {"required": True}, "schema": {"is_unique": True, "is_nullable": False}},
            {"field": "tipo",                "type": "string",  "meta": {"required": True}, "schema": {"is_nullable": False}},
            {"field": "numero_progressivo",  "type": "integer", "meta": {},                 "schema": {}},
            {"field": "display_title",       "type": "string",  "meta": {"required": True}, "schema": {"is_nullable": False}},
            {"field": "titolo_tema",         "type": "string",  "meta": {},                 "schema": {}},
            {"field": "descrizione",         "type": "text",    "meta": {},                 "schema": {}},
            {"field": "anno_pubblicazione",  "type": "integer", "meta": {},                 "schema": {}},
            {"field": "periodo_label",       "type": "string",  "meta": {},                 "schema": {}},
            {"field": "pdf_archive_url",     "type": "string",  "meta": {},                 "schema": {}},
            {"field": "wp_url",              "type": "string",  "meta": {},                 "schema": {}},
            # copertina → M2O directus_files (aggiunto dopo)
        ],
    },
    {
        "collection": "temi",
        "meta": {"icon": "label", "note": "Cluster semantici come tassonomia navigabile"},
        "schema": {},
        "fields": [
            {"field": "id",          "type": "uuid",    "meta": {"required": True}, "schema": {"is_primary_key": True, "has_auto_increment": False}},
            {"field": "slug",        "type": "string",  "meta": {"required": True}, "schema": {"is_unique": True, "is_nullable": False}},
            {"field": "nome",        "type": "string",  "meta": {"required": True}, "schema": {"is_nullable": False}},
            {"field": "descrizione", "type": "text",    "meta": {},                 "schema": {}},
            {"field": "cluster_id",  "type": "integer", "meta": {},                 "schema": {}},
            {"field": "colore_hex",  "type": "string",  "meta": {},                 "schema": {}},
        ],
    },
    {
        "collection": "tags",
        "meta": {"icon": "sell", "note": "Tag articoli"},
        "schema": {},
        "fields": [
            {"field": "id",     "type": "uuid",   "meta": {"required": True}, "schema": {"is_primary_key": True, "has_auto_increment": False}},
            {"field": "slug",   "type": "string", "meta": {"required": True}, "schema": {"is_unique": True, "is_nullable": False}},
            {"field": "nome",   "type": "string", "meta": {"required": True}, "schema": {"is_nullable": False}},
            {"field": "fonte",  "type": "string", "meta": {},                 "schema": {}},
        ],
    },
    {
        "collection": "articoli",
        "meta": {"icon": "article", "note": "Articoli OEL — collezione principale"},
        "schema": {},
        "fields": [
            {"field": "id",                   "type": "uuid",     "meta": {"required": True},  "schema": {"is_primary_key": True, "has_auto_increment": False}},
            {"field": "wp_id",                "type": "integer",  "meta": {},                  "schema": {}},
            {"field": "slug",                 "type": "string",   "meta": {"required": True},  "schema": {"is_unique": True, "is_nullable": False}},
            {"field": "lang",                 "type": "string",   "meta": {"required": True},  "schema": {"is_nullable": False, "default_value": "it"}},
            {"field": "titolo",               "type": "string",   "meta": {"required": True},  "schema": {"is_nullable": False}},
            {"field": "sottotitolo",          "type": "string",   "meta": {},                  "schema": {}},
            {"field": "corpo",                "type": "text",     "meta": {"special": ["cast-json"]}, "schema": {}},
            {"field": "stato",                "type": "string",   "meta": {"required": True},  "schema": {"is_nullable": False, "default_value": "draft"}},
            {"field": "data_pubblicazione",   "type": "dateTime", "meta": {},                  "schema": {}},
            {"field": "data_creazione",       "type": "dateTime", "meta": {"required": True, "special": ["date-created"]}, "schema": {}},
            {"field": "data_aggiornamento",   "type": "dateTime", "meta": {"required": True, "special": ["date-updated"]}, "schema": {}},
            {"field": "seo_title",            "type": "string",   "meta": {},                  "schema": {}},
            {"field": "seo_description",      "type": "string",   "meta": {},                  "schema": {}},
            {"field": "didascalia_copertina", "type": "string",   "meta": {},                  "schema": {}},
            {"field": "original_url",         "type": "string",   "meta": {},                  "schema": {}},
            {"field": "cluster_id",           "type": "integer",  "meta": {},                  "schema": {}},
            {"field": "umap_x",               "type": "float",    "meta": {},                  "schema": {}},
            {"field": "umap_y",               "type": "float",    "meta": {},                  "schema": {}},
            {"field": "umap_z",               "type": "float",    "meta": {},                  "schema": {}},
            {"field": "has_comments",         "type": "boolean",  "meta": {},                  "schema": {"default_value": False}},
            {"field": "note_redazione",       "type": "text",     "meta": {},                  "schema": {}},
        ],
    },
    {
        "collection": "commenti_storici",
        "meta": {"icon": "chat", "note": "Commenti storici importati da WordPress"},
        "schema": {},
        "fields": [
            {"field": "id",             "type": "uuid",     "meta": {"required": True}, "schema": {"is_primary_key": True, "has_auto_increment": False}},
            {"field": "wp_comment_id",  "type": "integer",  "meta": {},                 "schema": {}},
            {"field": "autore_nome",    "type": "string",   "meta": {},                 "schema": {}},
            {"field": "autore_email",   "type": "string",   "meta": {},                 "schema": {}},
            {"field": "testo",          "type": "text",     "meta": {"required": True}, "schema": {"is_nullable": False}},
            {"field": "data",           "type": "dateTime", "meta": {"required": True}, "schema": {"is_nullable": False}},
            {"field": "approvato",      "type": "boolean",  "meta": {"required": True}, "schema": {"default_value": True}},
            # articolo → M2O articoli (aggiunto dopo come relazione)
        ],
    },
    {
        "collection": "redirects",
        "meta": {"icon": "redirect", "note": "Redirect 301 da URL WordPress a URL Astro"},
        "schema": {},
        "fields": [
            {"field": "id",              "type": "uuid",    "meta": {"required": True}, "schema": {"is_primary_key": True, "has_auto_increment": False}},
            {"field": "source_url",      "type": "string",  "meta": {"required": True}, "schema": {"is_unique": True, "is_nullable": False}},
            {"field": "destination_url", "type": "string",  "meta": {"required": True}, "schema": {"is_nullable": False}},
            {"field": "status_code",     "type": "integer", "meta": {"required": True}, "schema": {"default_value": 301}},
            {"field": "note",            "type": "string",  "meta": {},                 "schema": {}},
        ],
    },
]

# Relazioni M2O (many-to-one): campi da aggiungere DOPO che le collections esistono
# Formato corretto API Directus: { collection, field, related_collection }
M2O_FIELDS = [
    # autori.foto → directus_files
    {
        "collection": "autori",
        "field": "foto",
        "type": "uuid",
        "meta": {"interface": "file-image", "special": ["file"]},
        "schema": {},
        "relation": {
            "collection": "autori",
            "field": "foto",
            "related_collection": "directus_files",
        },
    },
    # numeri_rivista.copertina → directus_files
    {
        "collection": "numeri_rivista",
        "field": "copertina",
        "type": "uuid",
        "meta": {"interface": "file-image", "special": ["file"]},
        "schema": {},
        "relation": {
            "collection": "numeri_rivista",
            "field": "copertina",
            "related_collection": "directus_files",
        },
    },
    # articoli.immagine_copertina → directus_files
    {
        "collection": "articoli",
        "field": "immagine_copertina",
        "type": "uuid",
        "meta": {"interface": "file-image", "special": ["file"]},
        "schema": {},
        "relation": {
            "collection": "articoli",
            "field": "immagine_copertina",
            "related_collection": "directus_files",
        },
    },
    # articoli.autore → autori
    {
        "collection": "articoli",
        "field": "autore",
        "type": "uuid",
        "meta": {"interface": "select-dropdown-m2o", "special": ["m2o"]},
        "schema": {},
        "relation": {
            "collection": "articoli",
            "field": "autore",
            "related_collection": "autori",
        },
    },
    # articoli.numero_rivista → numeri_rivista
    {
        "collection": "articoli",
        "field": "numero_rivista",
        "type": "uuid",
        "meta": {"interface": "select-dropdown-m2o", "special": ["m2o"]},
        "schema": {},
        "relation": {
            "collection": "articoli",
            "field": "numero_rivista",
            "related_collection": "numeri_rivista",
        },
    },
    # articoli.articolo_traduzione → articoli (self-referential)
    {
        "collection": "articoli",
        "field": "articolo_traduzione",
        "type": "uuid",
        "meta": {"interface": "select-dropdown-m2o", "special": ["m2o"]},
        "schema": {},
        "relation": {
            "collection": "articoli",
            "field": "articolo_traduzione",
            "related_collection": "articoli",
        },
    },
    # commenti_storici.articolo → articoli
    {
        "collection": "commenti_storici",
        "field": "articolo",
        "type": "uuid",
        "meta": {"interface": "select-dropdown-m2o", "special": ["m2o"], "required": True},
        "schema": {"is_nullable": False},
        "relation": {
            "collection": "commenti_storici",
            "field": "articolo",
            "related_collection": "articoli",
        },
    },
]

# Relazioni M2M: junction tables da creare
M2M_RELATIONS = [
    # articoli ↔ temi
    {
        "label": "articoli ↔ temi",
        "junction": "articoli_temi",
        "many_collection": "articoli",
        "many_field": "temi",
        "one_collection": "temi",
        "one_field": "articoli",
        "junction_field_many": "articoli_id",
        "junction_field_one":  "temi_id",
    },
    # articoli ↔ tags
    {
        "label": "articoli ↔ tags",
        "junction": "articoli_tags",
        "many_collection": "articoli",
        "many_field": "tags",
        "one_collection": "tags",
        "one_field": "articoli",
        "junction_field_many": "articoli_id",
        "junction_field_one":  "tags_id",
    },
]


# ─────────────────────────────────────────────────────────────────────────────
# API helpers
# ─────────────────────────────────────────────────────────────────────────────

def get_token():
    r = requests.post(f"{DIRECTUS_URL}/auth/login", json={
        "email": ADMIN_EMAIL, "password": ADMIN_PASS
    })
    r.raise_for_status()
    return r.json()["data"]["access_token"]


def api_get(token, path):
    r = requests.get(f"{DIRECTUS_URL}{path}",
                     headers={"Authorization": f"Bearer {token}"})
    return r.json()


def api_post(token, path, payload, dry_run=True):
    if dry_run:
        print(f"  [DRY] POST {path}")
        print(f"        {json.dumps(payload, ensure_ascii=False)[:120]}")
        return {"data": {}}
    r = requests.post(f"{DIRECTUS_URL}{path}",
                      headers={"Authorization": f"Bearer {token}",
                                "Content-Type": "application/json"},
                      json=payload)
    if not r.ok:
        print(f"  [ERR] POST {path} → {r.status_code}: {r.text[:300]}")
    else:
        print(f"  [OK ] POST {path} → {r.status_code}")
    return r.json() if r.ok else {}


def existing_collections(token):
    data = api_get(token, "/collections")
    return {c["collection"] for c in data.get("data", [])}


def existing_fields(token, collection):
    data = api_get(token, f"/fields/{collection}")
    return {f["field"] for f in data.get("data", [])}


# ─────────────────────────────────────────────────────────────────────────────
# Creation logic
# ─────────────────────────────────────────────────────────────────────────────

def create_collections(token, dry_run):
    existing = existing_collections(token)
    print("\n── STEP 1: Collections ──────────────────────────────────────")
    for coll in COLLECTIONS:
        name = coll["collection"]
        if name in existing:
            print(f"  [SKIP] {name} — già esistente")
            continue
        print(f"  {'[DRY]' if dry_run else '[CREATE]'} collection: {name}")
        # Crea collection con i suoi fields in una sola chiamata
        payload = {
            "collection": name,
            "meta": coll.get("meta", {}),
            "schema": coll.get("schema", {}),
            "fields": coll["fields"],
        }
        api_post(token, "/collections", payload, dry_run)


def existing_relations(token):
    data = api_get(token, "/relations")
    return {(r["collection"], r["field"]) for r in data.get("data", [])}


def create_m2o_fields(token, dry_run):
    print("\n── STEP 2: Campi M2O e file ─────────────────────────────────")
    ex_rels = existing_relations(token) if not dry_run else set()
    for rel in M2O_FIELDS:
        coll = rel["collection"]
        field = rel["field"]
        label = f"{coll}.{field} -> {rel['relation']['related_collection']}"
        # Campo: crea solo se non esiste
        if not dry_run:
            ex_f = existing_fields(token, coll)
            if field not in ex_f:
                field_payload = {"field": field, "type": rel["type"],
                                 "meta": rel.get("meta", {}), "schema": rel.get("schema", {})}
                api_post(token, f"/fields/{coll}", field_payload, dry_run)
            else:
                print(f"  [SKIP campo] {coll}.{field}")
        # Relazione: crea sempre se non esiste già
        if (coll, field) in ex_rels:
            print(f"  [SKIP rel  ] {label}")
        else:
            print(f"  [CREATE rel] {label}")
            api_post(token, "/relations", rel["relation"], dry_run)


def create_m2m_relations(token, dry_run):
    print("\n── STEP 3: Relazioni M2M ────────────────────────────────────")
    existing = existing_collections(token)
    for rel in M2M_RELATIONS:
        print(f"  {'[DRY]' if dry_run else '[CREATE]'} M2M: {rel['label']}")
        junc = rel["junction"]
        # 1. Crea junction table se non esiste
        if junc not in existing:
            junc_payload = {
                "collection": junc,
                "meta": {"hidden": True, "icon": "import_export"},
                "schema": {},
                "fields": [
                    {"field": "id",                        "type": "integer", "meta": {}, "schema": {"is_primary_key": True, "has_auto_increment": True}},
                    {"field": rel["junction_field_many"],  "type": "uuid",    "meta": {}, "schema": {}},
                    {"field": rel["junction_field_one"],   "type": "uuid",    "meta": {}, "schema": {}},
                ],
            }
            api_post(token, "/collections", junc_payload, dry_run)
        else:
            print(f"    [SKIP] junction {junc} — già esistente")

        ex_rels = existing_relations(token) if not dry_run else set()

        # 2. Campo alias M2M su many_collection (es. articoli.temi)
        if not dry_run:
            ex_f = existing_fields(token, rel["many_collection"])
            if rel["many_field"] not in ex_f:
                m2m_field_payload = {"field": rel["many_field"], "type": "alias",
                                     "meta": {"special": ["m2m"], "interface": "list-m2m"}, "schema": None}
                api_post(token, f"/fields/{rel['many_collection']}", m2m_field_payload, dry_run)
            else:
                print(f"    [SKIP campo] {rel['many_collection']}.{rel['many_field']}")

        # 3. Relazione junction.articoli_id → many_collection
        rel_many = {"collection": junc, "field": rel["junction_field_many"],
                    "related_collection": rel["many_collection"]}
        if (junc, rel["junction_field_many"]) in ex_rels:
            print(f"    [SKIP rel] {junc}.{rel['junction_field_many']}")
        else:
            api_post(token, "/relations", rel_many, dry_run)

        # 4. Relazione junction.temi_id/tags_id → one_collection
        rel_one = {"collection": junc, "field": rel["junction_field_one"],
                   "related_collection": rel["one_collection"]}
        if (junc, rel["junction_field_one"]) in ex_rels:
            print(f"    [SKIP rel] {junc}.{rel['junction_field_one']}")
        else:
            api_post(token, "/relations", rel_one, dry_run)


# ─────────────────────────────────────────────────────────────────────────────
# Dry-run summary
# ─────────────────────────────────────────────────────────────────────────────

def print_dry_run_summary():
    print("\n" + "=" * 60)
    print("DRY-RUN SUMMARY - cosa verrebbe creato")
    print("=" * 60)

    print("\nCOLLECTIONS:")
    for coll in COLLECTIONS:
        name = coll["collection"]
        fields = [f["field"] for f in coll["fields"]]
        print(f"\n  {name}  ({len(fields)} campi base)")
        for f in coll["fields"]:
            req = " *" if f["meta"].get("required") else ""
            print(f"    - {f['field']:30s} {f['type']}{req}")

    print("\nCAMPI M2O / FILE:")
    for rel in M2O_FIELDS:
        print(f"  {rel['collection']:20s}.{rel['field']:25s} -> {rel['relation']['one_collection']}")

    print("\nRELAZIONI M2M:")
    for rel in M2M_RELATIONS:
        print(f"  {rel['label']}")
        print(f"    junction: {rel['junction']} ({rel['junction_field_many']}, {rel['junction_field_one']})")

    total_fields = (
        sum(len(c["fields"]) for c in COLLECTIONS)
        + len(M2O_FIELDS)
        + len(M2M_RELATIONS)
    )
    print(f"\nTOTALE: {len(COLLECTIONS)} collections, {total_fields} campi/relazioni")
    print("        + 2 junction tables (articoli_temi, articoli_tags)")


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true",
                        help="Applica realmente (default: dry-run)")
    parser.add_argument("--relations-only", action="store_true",
                        help="Esegui solo lo step relazioni (collections già esistenti)")
    args = parser.parse_args()
    dry_run = not args.apply

    if dry_run and not args.relations_only:
        print("=== DRY-RUN (nessuna modifica al server) ===")
        print("    Usa --apply per applicare realmente.\n")
        print_dry_run_summary()
        return

    print("=== APPLY — connessione a Directus ===")
    token = get_token()
    print(f"Token ottenuto.\n")

    if args.relations_only:
        create_m2o_fields(token, dry_run=False)
        create_m2m_relations(token, dry_run=False)
    else:
        create_collections(token, dry_run=False)
        create_m2o_fields(token, dry_run=False)
        create_m2m_relations(token, dry_run=False)

    print("\n=== COMPLETATO ===")


if __name__ == "__main__":
    main()
