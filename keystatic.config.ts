import { config, collection, fields } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github',
    repo: 'SegreteriaFL/ombreeluci-astro',
  },
  ui: {
    brand: { name: 'Ombre e Luci — Redazione' },
  },
  collections: {
    articoli: collection({
      label: 'Nuovi Articoli',
      slugField: 'title',
      path: 'src/content/blog/NUOVI/*',
      format: {
        frontmatter: 'yaml',
        contentField: 'content',
      },
      schema: {
        // --- Obbligatori ---
        title: fields.text({ label: 'Titolo' }),
        date: fields.date({ label: 'Data pubblicazione' }),
        author: fields.text({ label: 'Autore' }),
        lang: fields.select({
          label: 'Lingua',
          options: [
            { label: 'Italiano', value: 'it' },
            { label: 'English', value: 'en' },
          ],
          defaultValue: 'it',
        }),
        // --- Opzionali ---
        cluster_id: fields.integer({
          label: 'Cluster',
          defaultValue: 0,
        }),
        id_numero: fields.text({
          label: 'Numero rivista (es. OEL-123)',
        }),
        numero_rivista: fields.integer({
          label: 'Numero progressivo',
        }),
        anno_rivista: fields.integer({
          label: 'Anno',
        }),
        image: fields.url({
          label: 'Immagine copertina (URL)',
        }),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          { label: 'Tag', itemLabel: (props) => props.value },
        ),
        // --- Corpo articolo ---
        content: fields.markdoc({
          label: 'Testo articolo',
          extension: 'md',
        }),
      },
    }),
  },
});
