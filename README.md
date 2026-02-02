# Ombre e Luci

Sito archivio della rivista Ombre e Luci, costruito con Astro. Database finale: **3488 articoli** in `src/data/articoli_megacluster.json`.

## Documentazione

- **Stato di stabilità e istruzioni:** [PROGRESS.md](./PROGRESS.md) — architettura dati, merge (V5 + Export PHP + API), autori (bio/foto), fix mobile, comandi per rigenerare.
- **Architettura dati:** [docs/ARCHITETTURA_DATI.md](./docs/ARCHITETTURA_DATI.md) — colonne V5, script di build, dipendenze.

## Rigenerare dati

```bash
node scripts/merge_media.js
node scripts/build_articoli_megacluster.js
```

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`     |
| `npm run dev -- --host`   | Same + accessibile in LAN (es. mobile sulla stessa Wi‑Fi) |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

