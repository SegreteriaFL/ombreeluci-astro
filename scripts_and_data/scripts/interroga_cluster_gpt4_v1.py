
import os
import openai
import pandas as pd
import json

# === CONFIGURAZIONE ===
from openai import OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# File locali
CSV_CLUSTER = "articoli_clusterizzati_con_nomi.csv"
JSON_ARTICOLI = "articoli_semantici.json"

# Cluster da analizzare
CLUSTER_ID = 0  # Cambia questo valore per altri cluster
MAX_ARTICOLI = 10  # Limite per non superare i token

# === CARICAMENTO DATI ===
df = pd.read_csv(CSV_CLUSTER)
ids = df[df["Cluster"] == CLUSTER_ID]["ID"].astype(str).tolist()

with open(JSON_ARTICOLI, "r") as f:
    articoli = json.load(f)

# Seleziona solo gli articoli del cluster desiderato
articoli_selezionati = [
    {
        "id": a["id"],
        "titolo": a["titolo"],
        "contenuto": a["contenuto_sem"]
    }
    for a in articoli
    if str(a["id"]) in ids
][:MAX_ARTICOLI]

# === COSTRUZIONE PROMPT ===
blocchi_html = [
    f"<h1>{a['titolo']}</h1>\n{a['contenuto']}"
    for a in articoli_selezionati
]

contenuto = "\n\n".join(blocchi_html)

prompt = f"""
Ti fornisco un insieme di articoli in HTML, ciascuno con un <h1> come titolo e poi contenuto HTML.
Analizza questi articoli come gruppo e rispondi alle seguenti domande:

1. Dai un titolo tematico coerente che rappresenti il gruppo.
2. Scrivi una breve descrizione su cosa accomuna questi articoli.
3. Se emergono sotto-temi distinti, elencali.
4. Se alcuni articoli sembrano fuori contesto rispetto agli altri, elencali.

Tieni conto della struttura semantica HTML (es. <h2>, <strong>, <em>, <a>...).

Articoli del cluster {CLUSTER_ID}:

{contenuto}
"""

# === CHIAMATA API GPT-4 ===
response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": prompt}
    ],
    temperature=0.3
)

# === OUTPUT ===
print("\n--- Risposta GPT-4 ---\n")
print(response.choices[0].message.content)
