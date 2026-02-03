# Report duplicati cluster--1 vs cluster numerati

Fonte: `bridge_articoli_numeri.csv`

## 1. Duplicati esatti (stesso slug in cluster--1 e in un cluster numerato)

**Azione suggerita:** eliminare il file in `cluster--1` (tenere la versione nel cluster numerato).

Nessun duplicato esatto trovato (stesso slug in entrambi).

## 2. Possibili duplicati (slug molto simile)

Slug in cluster--1 simile a uno in un cluster numerato (controllo manuale).

- **cluster--1:** `ii-barattolo-di-maionese-e-caffe` → `src\content\blog\cluster--1\ii-barattolo-di-maionese-e-caffe.md`
  **cluster numerato:** `ii-barattolo-di-maionese-e-caff` → `src\content\blog\cluster-0\ii-barattolo-di-maionese-e-caff.md`

- **cluster--1:** `cura-e-civilta` → `src\content\blog\cluster--1\cura-e-civilta.md`
  **cluster numerato:** `cura-e-civilt` → `src\content\blog\cluster-2\cura-e-civilt.md`

- **cluster--1:** `i-nostri-grandi-amici-charles-del-focauld-un-amico-di-gesu-nel-deserto` → `src\content\blog\cluster--1\i-nostri-grandi-amici-charles-del-focauld-un-amico-di-gesu-nel-deserto.md`
  **cluster numerato:** `i-nostri-grandi-amici-charles-del-focauld-un-amico-di-ges-nel-deserto` → `src\content\blog\cluster-3\i-nostri-grandi-amici-charles-del-focauld-un-amico-di-ges-nel-deserto.md` (typo: gesu → ges)

## 3. Solo in cluster--1 (nessun duplicato trovato)

- `src\content\blog\cluster--1\cura-e-civilta.md` (slug: `cura-e-civilta`)
- `src\content\blog\cluster--1\i-nostri-grandi-amici-charles-del-focauld-un-amico-di-gesu-nel-deserto.md` (slug: `i-nostri-grandi-amici-charles-del-focauld-un-amico-di-gesu-nel-deserto`)
- `src\content\blog\cluster--1\ii-barattolo-di-maionese-e-caffe.md` (slug: `ii-barattolo-di-maionese-e-caffe`)
- `src\content\blog\cluster--1\per-un-risveglio-religioso-dei-piu-handicappati.md` (slug: `per-un-risveglio-religioso-dei-piu-handicappati`)

---
Totale in cluster--1: 4
Duplicati esatti (da eliminare in cluster--1): 0
Possibili duplicati (slug simile): 3