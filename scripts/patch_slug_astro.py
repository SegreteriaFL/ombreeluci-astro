#!/usr/bin/env python3
"""
Migra src/pages/blog/[...slug].astro da file .md a Directus API.
Sostituisce il frontmatter (righe 1-439) con la versione Directus.
Applica le sostituzioni necessarie nel template HTML.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src" / "pages" / "blog" / "[...slug].astro"
OUT = SRC  # sovrascrive in place (branch dedicato)

NEW_FRONTMATTER = '''\
---
import { getAllArticoli, getArticoloBySlug, getImageUrl } from '../../lib/directus';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import EditorialFeedback from '../../components/EditorialFeedback.astro';
import ArticleCard from '../../components/ArticleCard.astro';
import { getLabels, getMegaclusterForArticle, getThemeLabel, getCategorySlugForArticle } from '../../config/taxonomy.js';
import { getLangFromUrl, t } from '../../utils/i18n';
import { ViewTransitions } from 'astro:transitions';
import autoriStats from '../../data/autori_stats.json';
import '../../styles/global.css';

const pathname = Astro.url.pathname;
const locale = getLangFromUrl(pathname);
const totalAutori = Array.isArray(autoriStats) ? autoriStats.length : 0;

// ── getStaticPaths ─────────────────────────────────────────────────────────────

export async function getStaticPaths() {
  const allArticoli = await getAllArticoli();
  const pairs = allArticoli.reduce((acc: Record<string, { it?: string; en?: string }>, a) => {
    const key = String(a.wp_id ?? '');
    if (!key) return acc;
    if (!acc[key]) acc[key] = {};
    if (a.lang === 'en') acc[key].en = a.slug;
    else acc[key].it = a.slug;
    return acc;
  }, {});
  const pairsCount = Object.values(pairs).filter((p) => p.it && p.en).length;
  console.log('[blog/[...slug].astro] getStaticPaths: articoli =', allArticoli.length, '| coppie IT+EN =', pairsCount);
  return allArticoli.map((articolo) => ({
    params: { slug: articolo.slug },
    props: { articoloMeta: articolo },
  }));
}

// ── Fetch articolo completo ────────────────────────────────────────────────────

const { articoloMeta } = Astro.props;
const articolo = await getArticoloBySlug(articoloMeta.slug);
if (!articolo) return Astro.redirect('/404');

const allArticoli = await getAllArticoli();

// ── Helper functions ───────────────────────────────────────────────────────────

function formatDateItalian(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

function generateAuthorSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function generateIssueSlug(issueNumber: string): string {
  return issueNumber.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

function calculateReadingTimeFromHtml(html: string | null): number {
  if (!html) return 3;
  const textOnly = html.replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ').trim();
  const wordCount = textOnly.split(/\\s+/).filter((w: string) => w.length > 0).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

// ── Dati articolo ──────────────────────────────────────────────────────────────

const articleTitle = articolo.titolo;
const articleDate = articolo.data_pubblicazione ? new Date(articolo.data_pubblicazione) : new Date();
const autoreCompleto = articolo.autore as any;
const autoreName: string = autoreCompleto?.nome_completo ?? articoloMeta.autore?.nome_completo ?? 'Autore sconosciuto';
const authorSlug = generateAuthorSlug(autoreName);

const authorBioHtml: string | null = autoreCompleto?.bio_html?.trim() || null;
const authorFotoId: string | null = autoreCompleto?.foto?.id ?? null;
const authorImagePath = authorFotoId ? getImageUrl(authorFotoId) : `/assets/authors/${authorSlug}.jpg`;
const authorBio: string | null = authorBioHtml;

const readingTime = calculateReadingTimeFromHtml(articolo.corpo);

// ── Issue (numero rivista) ─────────────────────────────────────────────────────

const issueNumber = articolo.numero_rivista?.id_numero ?? null;
const issueSlug = issueNumber ? generateIssueSlug(issueNumber) : null;
const issueLink = issueSlug ? `/archivio/${issueSlug}` : null;

// ── Immagine copertina ─────────────────────────────────────────────────────────

const articleImage = articolo.immagine_copertina?.id
  ? getImageUrl(articolo.immagine_copertina.id)
  : '/placeholder1.webp';

// ── Sottotitolo e SEO ──────────────────────────────────────────────────────────

const explicitSubtitle = articolo.sottotitolo?.trim() || null;
const heroCaption: string | null = null;

const metaDescription = (explicitSubtitle || articolo.seo_description)
  ? (explicitSubtitle || articolo.seo_description)!.substring(0, 160).replace(/\\s+/g, ' ').trim()
  : `${articleTitle} - Articolo pubblicato su Ombre e Luci`;

// ── Categoria, etichette, ruolo editoriale (taxonomy.js via megacluster) ───────

const categoryDisplay = getThemeLabel(articolo.wp_id);
const categorySlug = getCategorySlugForArticle(articolo.wp_id);
const categoryLink = categorySlug ? `/categoria/${categorySlug}` : null;
const currentLabels = getLabels([], articolo.wp_id);
const formaDisplay = currentLabels.formal !== 'Articolo' ? currentLabels.formal : null;
const hasIssue = issueNumber != null && String(issueNumber).trim() !== '';
const showPubblicatoOnline = !hasIssue;

const { ruolo_editoriale } = getMegaclusterForArticle(articolo.wp_id);
let roleLabel: string | null = null;
let roleClassName = '';
if (ruolo_editoriale === 'portante') {
  roleLabel = 'Portante';
  roleClassName = ' article-badge-role--portante';
} else if (ruolo_editoriale === 'strutturale') {
  roleLabel = 'Strutturale';
  roleClassName = ' article-badge-role--strutturale';
} else if (ruolo_editoriale === 'laterale') {
  roleLabel = 'Laterale';
  roleClassName = ' article-badge-role--laterale';
} else if (ruolo_editoriale === 'trasversale') {
  roleLabel = 'Trasversale';
  roleClassName = ' article-badge-role--trasversale';
}

// ── PDF e copertina numero rivista ─────────────────────────────────────────────

const pdfUrl: string | null = (articolo.numero_rivista as any)?.link_pdf ?? null;
const copeertinaUrl: string | null = null;
const isTranslation = articolo.lang === 'en';

// ── Language switcher ──────────────────────────────────────────────────────────

const isCurrentEn = articolo.lang === 'en';
const currentWpIdClean = String(articolo.wp_id ?? '');
const currentSlug = articolo.slug;

const alternateItem = currentWpIdClean
  ? allArticoli.find((a) =>
      String(a.wp_id) === currentWpIdClean &&
      a.id !== articolo.id &&
      (a.lang === 'en' ? !isCurrentEn : isCurrentEn)
    )
  : null;
const alternateArticleUrl = alternateItem ? `/blog/${alternateItem.slug}` : null;

// ── wpIdToSlugMap ──────────────────────────────────────────────────────────────

const wpIdToSlugMap: Record<number, string> = {};
for (const a of allArticoli) {
  if (a.wp_id && a.slug) wpIdToSlugMap[a.wp_id] = a.slug;
}

// ── inContentRelatedMap ────────────────────────────────────────────────────────

const inContentRelatedMap: Record<string, {
  title: string; image: string; excerpt: string | null;
  href: string; category?: string | null; lang?: string; isItalian?: boolean;
}> = {};

for (const a of allArticoli) {
  const imgUrl = a.immagine_copertina?.id ? getImageUrl(a.immagine_copertina.id) : '/placeholder1.webp';
  const lang = a.lang;
  const isItalian = lang !== 'en';
  const category = getCategorySlugForArticle(a.wp_id) ?? null;
  inContentRelatedMap[a.slug] = {
    title: a.titolo,
    image: imgUrl,
    excerpt: a.sottotitolo?.trim() || null,
    href: `/blog/${a.slug}`,
    category,
    lang,
    isItalian,
  };
}

// ── Articoli correlati in calce ────────────────────────────────────────────────

const relatedCategorySlug = categorySlug;
const relatedArticles = relatedCategorySlug
  ? allArticoli
      .filter((a) => {
        if (a.id === articolo.id) return false;
        const aCategorySlug = getCategorySlugForArticle(a.wp_id);
        const isSameLang = isCurrentEn ? a.lang === 'en' : a.lang !== 'en';
        return isSameLang && aCategorySlug === relatedCategorySlug;
      })
      .slice(0, 3)
      .map((a) => {
        const imgUrl = a.immagine_copertina?.id ? getImageUrl(a.immagine_copertina.id) : '/placeholder1.webp';
        const labels = getLabels([], a.wp_id);
        const { ruolo_editoriale: relRuolo } = getMegaclusterForArticle(a.wp_id);
        const categoriaMenu = getThemeLabel(a.wp_id) ?? null;
        return {
          title: a.titolo,
          author: a.autore?.nome_completo ?? 'Autore sconosciuto',
          date: a.data_pubblicazione ? new Date(a.data_pubblicazione) : new Date(),
          issue: a.numero_rivista?.id_numero ?? null,
          slug: a.slug,
          image: imgUrl,
          categoriaMenu,
          forma: labels.formal,
          ruoloEditoriale: relRuolo,
        };
      })
  : [];
---
'''

# Template substitutions: (old, new) tuples
# Applied to the template section (HTML/script) only
TEMPLATE_SUBS = [
    # <head> meta tags
    ('{articleBySlug.data.title} - Ombre e Luci', '{articleTitle} - Ombre e Luci'),
    ('content={articleBySlug.data.title}', 'content={articleTitle}'),
    ('typeof articleImage === \'string\' ? articleImage : articleImage.src',
     'articleImage'),
    # h1
    ('{articleBySlug.data.title}</h1>', '{articleTitle}</h1>'),
    # article-meta: author
    ('alt={articleBySlug.data.author}', 'alt={autoreName}'),
    ('{articleBySlug.data.author.charAt(0).toUpperCase()}',
     '{autoreName.charAt(0).toUpperCase()}'),
    ('>{articleBySlug.data.author}</a>', '>{autoreName}</a>'),
    # article-meta: date
    ('formatDateItalian(articleBySlug.data.date)',
     'formatDateItalian(articleDate)'),
    # archival alerts
    ('articleBySlug.data.date.getFullYear() < 2000',
     'articleDate.getFullYear() < 2000'),
    ('del {articleBySlug.data.date.getFullYear()}',
     'del {articleDate.getFullYear()}'),
    ('articleBySlug.data.is_translation && articleBySlug.data.date.getFullYear()',
     'isTranslation && articleDate.getFullYear()'),
    ('{articleBySlug.data.date.getFullYear()}', '{articleDate.getFullYear()}'),
    # social share title references
    ('encodeURIComponent(articleBySlug.data.title + \' \' + Astro.url.href)',
     'encodeURIComponent(articleTitle + \' \' + Astro.url.href)'),
    ('text=${encodeURIComponent(articleBySlug.data.title)}',
     'text=${encodeURIComponent(articleTitle)}'),
    ('subject=${encodeURIComponent(articleBySlug.data.title)}',
     'subject=${encodeURIComponent(articleTitle)}'),
    # <Content /> → set:html
    ('<Content />', '<div set:html={articolo.corpo ?? \'\'} />'),
    # author bio section
    ('>{articleBySlug.data.author}</a>\n              </h3>',
     '>{autoreName}</a>\n              </h3>'),
    # EditorialFeedback
    ('wpId={articleBySlug.data.wp_id}', 'wpId={articolo.wp_id}'),
    ('title={articleBySlug.data.title}', 'title={articleTitle}'),
    # floating-widget
    ('href={articleBySlug.data.pdf_url}', 'href={pdfUrl}'),
    # numero-rivista section
    ('(articleBySlug.data.pdf_url || articleBySlug.data.copertina_url)',
     '(pdfUrl || copeertinaUrl)'),
    ('articleBySlug.data.numero_rivista && articleBySlug.data.anno_rivista',
     'articolo.numero_rivista?.display_title && articolo.numero_rivista?.anno_pubblicazione'),
    ('{articleBySlug.data.copertina_url && (', '{copeertinaUrl && ('),
    ('src={articleBySlug.data.copertina_url}', 'src={copeertinaUrl}'),
    ('`Copertina numero ${articleBySlug.data.numero_rivista || \'\'}`',
     '`Copertina numero ${articolo.numero_rivista?.id_numero || \'\'}`'),
    ('{articleBySlug.data.pdf_url && (', '{pdfUrl && ('),
    ('href={articleBySlug.data.pdf_url}', 'href={pdfUrl}'),
    # has_comments
    ('articleBySlug.data.has_comments', 'articolo.has_comments'),
    # debug section
    ('{JSON.stringify(articleBySlug.data, null, 2)}',
     '{JSON.stringify({ id: articolo.id, wp_id: articolo.wp_id, slug: articolo.slug, titolo: articolo.titolo, lang: articolo.lang, stato: articolo.stato, data_pubblicazione: articolo.data_pubblicazione }, null, 2)}'),
    ('{articleBySlug.id}\nSlug: {articleBySlug.slug}',
     '{articolo.id}\nSlug: {articolo.slug}'),
]


def main():
    content = SRC.read_text(encoding='utf-8')

    # Find the boundary between frontmatter and template
    # Frontmatter: starts at char 0, ends at second '---' (on its own line)
    # The template starts with '<html lang="it">'
    # Find the closing '---' of frontmatter
    # It's the second occurrence of '\n---\n'
    first_delim = content.index('---\n')
    # Find the second '---\n' (closing frontmatter), skip past first
    second_delim_pos = content.index('\n---\n', first_delim + 4)
    # second_delim_pos points to '\n---\n', the frontmatter ends after the '---\n'
    template_start = second_delim_pos + len('\n---\n')

    template = content[template_start:]

    # Apply template substitutions
    for old, new in TEMPLATE_SUBS:
        if old in template:
            template = template.replace(old, new, 1)
            print(f'  OK: replaced "{old[:60]}..."' if len(old) > 60 else f'  OK: replaced "{old}"')
        else:
            print(f'  MISS: not found "{old[:60]}..."' if len(old) > 60 else f'  MISS: not found "{old}"')

    new_content = NEW_FRONTMATTER + '\n' + template
    OUT.write_text(new_content, encoding='utf-8')
    print(f'\nScritto: {OUT}')
    print(f'Righe totali: {new_content.count(chr(10))}')


if __name__ == '__main__':
    main()
