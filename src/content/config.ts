import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    // Campi essenziali - tutti opzionali con default per evitare errori
    title: z.union([
      z.string(),
      z.null().transform(() => 'Titolo mancante'),
    ]).default('Titolo mancante'),
    date: z.union([
      z.string().transform((str) => {
        try {
          const d = new Date(str);
          return isNaN(d.getTime()) ? new Date() : d;
        } catch {
          return new Date();
        }
      }),
      z.date(),
    ]).default(new Date()),
    author: z.union([
      z.string(),
      z.null().transform(() => 'Autore sconosciuto'),
    ]).default('Autore sconosciuto'),
    // NOTA: 'slug' NON può essere nello schema - è riservato da Astro per la generazione automatica
    cluster_id: z.union([z.number(), z.string().transform(s => parseInt(s) || 0)]).default(0),
    wp_id: z.union([z.number(), z.string().transform(s => parseInt(s) || 0)]).optional(),
    original_url: z.union([
      z.string().url(),
      z.string().optional(),
    ]).optional(),
    has_comments: z.union([z.boolean(), z.string().transform(s => s === 'true')]).default(false),

    // Tags e categorie
    tags: z.union([
      z.array(z.string()),
      z.string().transform(s => s.split(',').map(t => t.trim())),
    ]).optional(),

    // Numero rivista (opzionali)
    id_numero: z.string().optional(),
    numero_rivista: z.union([z.number(), z.string().transform(s => parseInt(s) || 0)]).optional(),
    anno_rivista: z.union([z.number(), z.string().transform(s => parseInt(s) || 0)]).optional(),
    issue_number: z.string().optional(),
    lang: z.enum(['it', 'en']).default('it'),
    periodo_label: z.string().optional(),
    pdf_url: z.union([
      z.string().url(),
      z.string().optional(),
    ]).optional(),
    archive_id: z.string().optional(),
    copertina_url: z.union([
      z.string().url(),
      z.string().optional(),
    ]).optional(),

    // UMAP coordinates
    umap_x: z.union([z.number(), z.string().transform(s => parseFloat(s) || 0)]).optional(),
    umap_y: z.union([z.number(), z.string().transform(s => parseFloat(s) || 0)]).optional(),
    umap_z: z.union([z.number(), z.string().transform(s => parseFloat(s) || 0)]).optional(),

    // Campi legacy (mantenuti per compatibilità)
    theme: z.string().optional(),
    image: z.union([
      z.string().url(),
      z.string().optional(),
    ]).nullable().optional(),
    is_translation: z.union([z.boolean(), z.string().transform(s => s === 'true')]).optional(),
    original_slug: z.string().optional(),
    tema_code: z.string().optional(),
    tema_label: z.string().optional(),
    categoria_menu: z.string().optional(),
  }).passthrough(),
});

/**
 * Collezione numeri (src/content/numeri/).
 * Campi allineati al JSON numeri_consolidati + frontmatter esistente (.md con id, title, tipo, numero, anno, ecc.).
 */
const numeri = defineCollection({
  type: 'content',
  schema: z.object({
    // Frontmatter esistente (file .md attuali)
    id: z.string().optional(),
    title: z.string().optional(),
    tipo: z.string().optional(),
    numero: z.union([z.number(), z.string().transform(s => parseInt(s, 10) || 0)]).optional(),
    anno: z.union([z.string(), z.number()]).optional(),
    data_pubblicazione: z.string().optional(),
    sommario: z.string().optional(),
    copertina: z.union([z.string().url(), z.string(), z.null()]).optional(),
    link_sfoglia: z.union([z.string().url(), z.string()]).optional(),
    link_pdf: z.union([z.string().url(), z.string()]).optional(),
    wp_url: z.union([z.string().url(), z.string()]).optional(),

    // Campi estratti dal JSON (numeri_consolidati)
    id_numero: z.string().optional(),
    tipo_rivista: z.string().optional(),
    numero_progressivo: z.union([z.number(), z.string().transform(s => parseInt(s, 10) || 0)]).optional(),
    display_title: z.string().optional(),
    titolo_numero: z.string().optional(),
    seo_description: z.string().optional(),
    descrizione_originale: z.string().optional(),
    descrizione_ai: z.string().nullable().optional(),
    anno_pubblicazione: z.union([z.number(), z.string().transform(s => parseInt(s, 10) || 0)]).optional(),
    anno_collezione: z.union([z.number(), z.string(), z.null()]).optional(),
    periodicita: z.string().nullable().optional(),
    periodo_label: z.string().nullable().optional(),
    copertina_url: z.union([z.string().url(), z.string(), z.null()]).optional(),
    wp_url_numero: z.union([z.string().url(), z.string()]).optional(),
    canonical_url: z.union([z.string().url(), z.string()]).optional(),
    archive_org_item_id: z.string().nullable().optional(),
    archive_view_url: z.union([z.string().url(), z.string(), z.null()]).optional(),
    archive_download_pdf_url: z.union([z.string().url(), z.string(), z.null()]).optional(),
    articoli_ids: z.array(z.string()).optional(),
    articoli_urls: z.array(z.string()).optional(),
    issues: z.array(z.unknown()).optional(),
  }).passthrough(),
});

export const collections = {
  blog,
  numeri,
};
