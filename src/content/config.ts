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
    
    // Numero rivista
    numero_rivista: z.union([z.number(), z.string().transform(s => parseInt(s) || 0)]).optional(),
    anno_rivista: z.union([z.number(), z.string().transform(s => parseInt(s) || 0)]).optional(),
    issue_number: z.string().optional(), // ID numero rivista (es. "INS-10", "OEL-146")
    id_numero: z.string().optional(), // Stesso valore di issue_number (es. "OEL-86")
    lang: z.enum(['it', 'en']).default('it'), // Lingua articolo (default: it)
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
    // Home editoriale: in futuro opzionali featured (primo piano) e theme_highlight (blocchi tematici)
    // featured: z.boolean().optional(),
    // theme_highlight: z.boolean().optional(),
  }).passthrough(), // Permette campi extra per compatibilità
});

export const collections = {
  blog,
};

