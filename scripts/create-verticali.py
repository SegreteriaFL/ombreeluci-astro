#!/usr/bin/env python3
"""Crea le 5 verticali in Directus via REST API."""

import json, urllib.request, urllib.error

TOKEN = "ebgg-l6cPyahbgUOloDgmUteOvOOw7NH"
BASE  = "https://cms.ombreeluci.it"

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type":  "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
}

def api(method, path, body=None):
    data = json.dumps(body).encode() if body else None
    req  = urllib.request.Request(f"{BASE}{path}", data=data, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        print(f"  ERROR {e.code}: {e.read().decode()[:300]}")
        return None

def create_verticale(v):
    print(f"\n{'='*60}\nCreo: {v['titolo']}")
    payload = {
        "slug":               v["slug"],
        "slug_en":            v["slug_en"],
        "titolo":             v["titolo"],
        "titolo_en":          v.get("titolo_en"),
        "seo_description":    v.get("seo_description"),
        "seo_description_en": v.get("seo_description_en"),
        "tema_visivo":        v.get("tema_visivo", "chiaro"),
        "hero_immagine":      v.get("hero_immagine"),
        "hero_video_url":     v.get("hero_video_url"),
        "intro":              v.get("intro"),
        "intro_en":           v.get("intro_en"),
        "pubblicato":         True,
    }
    res = api("POST", "/items/verticali", payload)
    if not res:
        print("  FALLITO creazione verticale")
        return
    vert_id = res["data"]["id"]
    print(f"  Verticale ID={vert_id}")

    for i, sezione in enumerate(v.get("sezioni", [])):
        ordine = (i + 1) * 10
        s_payload = {
            "verticale_id":      vert_id,
            "tipo":              sezione["tipo"],
            "ordine":            ordine,
            "titolo_sezione":    sezione.get("titolo_sezione"),
            "titolo_sezione_en": sezione.get("titolo_sezione_en"),
            "testo":             sezione.get("testo"),
            "testo_en":          sezione.get("testo_en"),
        }
        s_res = api("POST", "/items/verticale_blocchi", s_payload)
        if not s_res:
            print(f"  FALLITO blocco {i}")
            continue
        blocco_id = s_res["data"]["id"]
        print(f"  Blocco [{sezione['tipo']}] ID={blocco_id} - {sezione.get('titolo_sezione','')}")

        for art_id in sezione.get("articoli", []):
            a_res = api("POST", "/items/verticale_blocchi_articoli", {
                "blocco_id":   blocco_id,
                "articolo_id": art_id,
            })
            status = "ok" if a_res else "FALLITO"
            print(f"    {status} {art_id[:8]}...")

    print(f"  OK: {v['titolo']}")


VERTICALI = [

    # ── 0. AUTISMO ────────────────────────────────────────────────────────────
    {
        "slug":    "autismo",
        "slug_en": "autism",
        "titolo":  "Autismo",
        "titolo_en": "Autism",
        "tema_visivo": "chiaro",
        "hero_immagine": "a94f52d9-faf0-49ba-bd45-5d9a2514da55",
        "seo_description": "La sindrome dello spettro autistico: testimonianze, storie e riflessioni raccolte in 40 anni di pubblicazioni.",
        "seo_description_en": "Autism spectrum disorder: testimonies, stories and reflections gathered over 40 years of publication.",
        "intro": (
            "La sindrome dello spettro autistico è una condizione complessa e sfaccettata: "
            "non basta conoscere una persona che la viva per farsene un'idea. "
            "In più, è una realtà in costante, inesorabile aumento: le ultime statistiche "
            "la indicano possibile per un bambino ogni 54 nati.\n\n"
            "In questa pagina vi proponiamo alcune delle testimonianze che abbiamo raccolto "
            "in 40 anni di pubblicazioni. Ne troverete alcune con terminologie ormai desuete "
            "che testimoniano però il cammino fatto per conoscere sempre meglio questa sindrome. "
            "Tante tessere di un mosaico per avvicinarsi, in punta di piedi, allo sfaccettato "
            "mondo della sindrome dello spettro autistico e imparare a incontrare le persone "
            "che vivono dietro questa diagnosi."
        ),
        "intro_en": (
            "Autism spectrum disorder is a complex and multifaceted condition: knowing one person "
            "who lives with it is not enough to understand it. Moreover, it is a reality in constant, "
            "relentless increase: the latest statistics indicate it as possible for one child in every 54 born.\n\n"
            "On this page we offer some of the testimonies we have gathered over 40 years of publications."
        ),
        "sezioni": [
            {
                "tipo": "articoli",
                "titolo_sezione":    "Testimonianze e storie",
                "titolo_sezione_en": "Testimonies and stories",
                "articoli": [
                    "1df08cc7-b311-4dd1-8ba8-7d0a9869dad0",  # un-panorama-riscoprire
                    "bcebf5d2-05ad-4c86-ad76-579835bbb7e7",  # lemozione-non-voce
                    "2d00fefd-ee29-439e-b3d2-f7362040a55e",  # senso-la-vita-paolo
                    "51de45f4-4bbb-4283-bbe5-50453b52b145",  # momenti-difficili
                    "2f8919b5-7629-4d7f-be0a-0f546b5972ee",  # la-lezione-del-femminismo
                    "e1cda15a-7c0b-4384-ad76-78ae15d5a78e",  # ora-sto-diventare-mamma
                    "7e0eea81-0ddd-40c2-8da5-5c74c5b26fc3",  # nicola-pintus
                    "2083238a-8092-4b84-ab4a-1886662513d2",  # autismo-e-integrazione-scolastica
                ],
            },
        ],
    },

    # ── 1. NOI, PAPÀ ─────────────────────────────────────────────────────────
    {
        "slug":    "noi-papa-un-figlio-disabile",
        "slug_en": "we-fathers-of-a-disabled-child",
        "titolo":  "Noi, papà di un figlio disabile",
        "titolo_en": "We, fathers of a disabled child",
        "tema_visivo": "caldo",
        "hero_immagine": None,
        "seo_description": "Il ruolo del padre nell'accoglienza e nell'educazione del figlio con disabilità: testimonianze dirette.",
        "seo_description_en": "The father's role in welcoming and raising a child with disability: first-hand testimonies.",
        "intro": (
            "Sono spesso criticati o presi in giro per la loro incompetenza nell'accudire un figlio appena nato. "
            "Le cose si complicano e molto quando in casa c'è un figlio o figlia che ha bisogno di cura e "
            "attenzioni speciali.\n\n"
            "Le testimonianze che abbiamo raccolto dicono bene e con sincerità quanto grande e importante "
            "sia il ruolo che un papà può avere nell'accoglienza e nell'educazione del figlio disabile. "
            "Quanto merito e riconoscenza sia da assegnare a loro quando, in modo diverso da noi mamme, "
            "si impegnano a proteggere, sostenere e condurre la loro lotta perché il figlio sia elemento "
            "di unione, di crescita e di soddisfazione per tutta la famiglia."
        ),
        "intro_en": (
            "Things get complicated when there is a child in the home who needs special care and attention. "
            "These testimonies honestly show how great and important the role of a father can be in welcoming "
            "and raising a disabled child."
        ),
        "sezioni": [
            {
                "tipo": "articoli",
                "titolo_sezione":    "Ogni figlio è un cammino",
                "titolo_sezione_en": "Every child is a journey",
                "articoli": [
                    "bc3ab4da-fe4e-4c52-8088-cd9ee940fd4a",  # il-lato-b-di-essere-papa
                    "f89ef4fa-dbd8-4309-ad18-7dbd8575ddf7",  # mio-figlio-luciano
                    "31631ec1-87c9-46a0-ac67-e6c35fe1ad27",  # smack-come-bacio
                    "9117a160-6247-40f5-95eb-67d49519f498",  # la-lotta-del-padre-cittadino
                    "6419c31c-3f03-4d19-85b4-9a092b0747a1",  # pazienza-tenacia-anche-durezza
                    "128cdc76-ed76-4626-87d9-622a1858f775",  # itinerari-paralleli
                    "6a0f80f0-bbff-42e0-8dd2-ad526f1bcd8c",  # con-suo-padre
                ],
            },
        ],
    },

    # ── 2. AKTION T4 ─────────────────────────────────────────────────────────
    {
        "slug":    "aktion-t4-sterminio-persone-disabilita",
        "slug_en": "aktion-t4-extermination-disabled-people",
        "titolo":  "Aktion T4 — lo sterminio",
        "titolo_en": "Aktion T4 — the Extermination",
        "tema_visivo": "scuro",
        "hero_immagine": "1dcf30c5-edca-49f7-93ae-a9641533cdaa",
        "seo_description": "L'operazione T4: lo sterminio su larga scala delle persone con disabilità ideato e praticato dal nazismo.",
        "seo_description_en": "Operation T4: the large-scale extermination of disabled people designed and carried out by Nazism.",
        "intro": (
            "Ombre e Luci è la nostra testata, il nostro motto, le tre parole che riflettono "
            "il modo in cui — da quasi quarant'anni ormai — raccontiamo e viviamo il mondo "
            "della disabilità e della fragilità. Ma questa volta il buio è totale. "
            "Perché le ombre si fanno densissime quando si tratta di raccontare l'operazione T4, "
            "e cioè lo sterminio su larga scala delle persone con disabilità ideato e praticato dal nazismo.\n\n"
            "Il bilancio finale fu di circa 250.000 persone uccise, tra cui 5.000 bambini, il più "
            "delle volte dopo essere state sottoposte a terribili sofferenze e a esperimenti criminali."
        ),
        "intro_en": (
            "The final toll was approximately 250,000 people killed, including 5,000 children, most often "
            "after being subjected to terrible suffering and criminal experiments. "
            "Here we gather our articles and reviews on Operation T4 and the Nazi extermination of disabled people."
        ),
        "sezioni": [
            {
                "tipo": "articoli",
                "titolo_sezione":    "Articoli e recensioni",
                "titolo_sezione_en": "Articles and reviews",
                "articoli": [
                    "42870a6e-e9fa-4490-bc43-d8650a955fa6",  # ausmerzen-vite-indegne
                    "91a16735-afba-41d1-af2e-0b6720fd390e",  # il-piccolo-adolph
                    "40378063-f830-4cf3-9d2f-feb410457a33",  # zavorre-prescelti
                    "06f8f7d2-c7e9-413e-94d9-d5e25c0d5166",  # i-bambini-di-asperger
                    "72acd395-e9a9-46ae-8037-5ec45f5c43e0",  # in-memoriam-aktion-t4-la-mostra
                    "feb1e253-2a87-479c-9365-a65b2706055c",  # nebbia-in-agosto
                    "74c8e384-e38f-4344-80bd-f781110d7f4f",  # un-giardino-per-ofelia
                    "d75ac67e-2474-451b-8b85-95049f15bff3",  # il-nostro-incontro-con-liliana-segre
                    "289d7da3-3acc-4353-a8a8-e066dab60d6f",  # mi-importa-solo-come-sei-ora
                ],
            },
        ],
    },

    # ── 3. CINEMA E DISABILITÀ ────────────────────────────────────────────────
    {
        "slug":    "speciale-cinema-e-disabilita",
        "slug_en": "cinema-and-disability",
        "titolo":  "Speciale: Cinema e disabilità",
        "titolo_en": "Special: Cinema and Disability",
        "tema_visivo": "magazine",
        "hero_immagine": "231eb38f-554a-47c8-993e-d94893bdbb96",
        "seo_description": "Come il grande schermo racconta la disabilità: speciale con critici cinematografici e persone con disabilità.",
        "seo_description_en": "How cinema portrays disability: a special feature with film critics and people with disabilities.",
        "intro": (
            "Su queste pagine abbiamo più volte raccontato come sul grande schermo viene affrontato "
            "il tema della disabilità. Con questo speciale proviamo a fare il punto "
            "anche con il contributo di alcuni esperti del settore.\n\n"
            "Farsi balenare il pensiero che qualcuno possa essere «diverso» a causa di un neo — "
            "grande o piccolo che possa essere — non è diverso dal giudicare qualcuno per il "
            "colore della pelle o per il suo credo. Anche questa è discriminazione."
        ),
        "intro_en": (
            "On these pages we have often recounted how cinema addresses the theme of disability. "
            "With this special feature we try to take stock, also with the contribution of experts in the field.\n\n"
            "Thinking that someone could be «different» because of a flaw — big or small — is no different "
            "from judging someone by the colour of their skin or their beliefs. This too is discrimination."
        ),
        "sezioni": [
            {
                "tipo": "articoli",
                "titolo_sezione":    "Film, recensioni e riflessioni",
                "titolo_sezione_en": "Films, reviews and reflections",
                "articoli": [
                    "a0d71c11-3fff-4900-bd8f-9d6f98915294",  # speciale-cinema-e-disabilita
                    "e742005d-866a-48c9-9bef-4e88ba2511f6",  # gli-altri-siamo-noi
                    "d9aa250e-3bd3-4841-aaa0-f8fd6064988a",  # non-mi-piace-andare-al-cinema
                    "7919e055-0dff-4948-b458-0bd4f57adc15",  # la-loro-vita-nei-film
                    "280c9ebd-2c46-465c-b762-8a6941d16653",  # la-forma-della-voce-recensione
                    "22980a7e-ad70-430d-805d-4422c4d01148",  # gli-oscar-premiano-la-disabilita
                ],
            },
        ],
    },

    # ── 4. CIAO STEFANO DI FRANCO ─────────────────────────────────────────────
    {
        "slug":    "ciao-stefano-di-franco",
        "slug_en": "ciao-stefano-di-franco",
        "titolo":  "Ciao Stefano",
        "titolo_en": "Ciao Stefano",
        "tema_visivo": "chiaro",
        "hero_immagine": None,
        "hero_video_url": "https://www.youtube.com/watch?v=6qbkdxXgSwU",
        "seo_description": "Ricordo di Stefano Di Franco, coordinatore di Fede e Luce, che ha intessuto legami di cuore con molte persone con e senza handicap.",
        "seo_description_en": "In memory of Stefano Di Franco, Faith and Light coordinator, who built heartfelt bonds with many people with and without disabilities.",
        "intro": (
            "Stefano Di Franco — per gli amici il Capitano — ha intessuto legami di cuore con molte persone "
            "con o senza handicap, piccole e grandi, genitori o figli, nella sua comunità di Fede e Luce, "
            "all'Arca, nel suo lavoro, senza alcuna distinzione. Cogliendo sempre quanto di prezioso ci sia "
            "nella possibilità di un incontro che rivela la bellezza dell'altro.\n\n"
            "Come coordinatore della provincia Kimata ha portato l'esperienza di Fede e Luce in Italia "
            "e nel mondo: nel giorno della sua scomparsa lo ricordiamo con gli articoli scritti da lui "
            "e dai suoi amici.\n\n"
            "«Nessuno resti solo.» — Stefano Di Franco"
        ),
        "intro_en": (
            "Stefano Di Franco — known to friends as il Capitano — built heartfelt bonds with many people, "
            "with or without disabilities, young and old, parents and children, in his Faith and Light community, "
            "at l'Arche, and in his work, without distinction.\n\n"
            "\"No one shall remain alone.\" — Stefano Di Franco"
        ),
        "sezioni": [
            {
                "tipo": "articoli",
                "titolo_sezione":    "Scritti di e per Stefano",
                "titolo_sezione_en": "Writings by and for Stefano",
                "articoli": [
                    "71afbd0d-e71e-4b96-a9ee-a0db2493b883",  # figli-delle-stelle
                    "721773cd-55c4-4bce-86d2-72ae44bc39e9",  # ehi-campione-come-va-da-lassu
                    "4aa0e462-84be-4c1d-8411-10b112b66b75",  # nessuno-resti-solo
                    "a8a3d258-7efb-4cab-81a8-9db1815e51fd",  # te-lo-ricordi-frate
                    "793d3ea3-5c9a-497c-8df3-e3a15b27479a",  # con-gli-occhi-di-un-bambino
                    "2abc0059-367f-4790-864d-d74848ecfbbe",  # mi-saro-fatto-un-idea
                    "36d4480c-5cda-4fbb-8d88-15455af83309",  # la-mia-vita-santa-palomba
                    "47aac753-15b7-4f4b-ab5e-f813ee9347ac",  # una-piccola-barca
                ],
            },
        ],
    },

]

if __name__ == "__main__":
    # Autismo (index 0) gia' creato manualmente come ID=3; skip
    for v in VERTICALI[1:]:
        create_verticale(v)
    print("\nDone.")
