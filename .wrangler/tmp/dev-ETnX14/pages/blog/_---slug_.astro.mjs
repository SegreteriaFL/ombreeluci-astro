globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, m as maybeRenderHead, a as addAttribute, r as renderTemplate, b as createAstro, d as renderComponent, F as Fragment, h as defineScriptVars, u as unescapeHTML } from '../../chunks/astro/server_CgTYz_Tl.mjs';
import { a as getArticoloCopertinaSrc, i as directusCredsFromAstroLocals, j as getArticoloBySlug, k as getArticoliBySlugList, C as COPERTINA_IMG_ONERROR, e as getAutoreImageUrl } from '../../chunks/directus_CErDsJ21.mjs';
import { g as getPlaceholder, $ as $$ArticleCard } from '../../chunks/ArticleCard_Bg_X0yvL.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_C30xb79o.mjs';
/* empty css                                     */
import { h as getLangFromUrl, i as getThemeLabel, f as getCategorySlugForArticle, a as getLabels, g as getMegaclusterForArticle, t } from '../../chunks/Footer_DUMK_LJf.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro$2 = createAstro();
const $$EditorialFeedback = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$EditorialFeedback;
  const { wpId, title, currentRole, url, articoloId } = Astro2.props;
  const directusEditUrl = articoloId ? `https://cms.ombreeluci.it/admin/content/articoli/${articoloId}` : "https://cms.ombreeluci.it/admin/content/articoli";
  return renderTemplate`<!-- Bottone modifica Directus (sempre nel DOM, mostrato via JS) -->${maybeRenderHead()}<a id="directus-edit-btn"${addAttribute(directusEditUrl, "href")} target="_blank" rel="noopener noreferrer" class="directus-edit-btn" hidden data-astro-cid-7umwo7jf>
✏ Modifica in Directus
</a> <aside class="editorial-feedback" aria-label="Box revisione editoriale" id="editorial-feedback-box" hidden data-astro-cid-7umwo7jf> <div class="editorial-feedback-header" data-astro-cid-7umwo7jf> <span class="editorial-feedback-title" data-astro-cid-7umwo7jf>BOX REVISIONE EDITORIALE</span> </div> <form id="editorial-feedback-form" class="editorial-feedback-form" data-astro-cid-7umwo7jf> <div class="editorial-feedback-row" data-astro-cid-7umwo7jf> <label for="proposed_role" class="editorial-feedback-label" data-astro-cid-7umwo7jf>Ruolo proposto</label> <select id="proposed_role" name="proposed_role" class="editorial-feedback-select" data-astro-cid-7umwo7jf> <option value="" data-astro-cid-7umwo7jf>Nessun cambio</option> <option value="portante" data-astro-cid-7umwo7jf>portante</option> <option value="strutturale" data-astro-cid-7umwo7jf>strutturale</option> <option value="laterale" data-astro-cid-7umwo7jf>laterale</option> <option value="trasversale" data-astro-cid-7umwo7jf>trasversale</option> </select> </div> <div class="editorial-feedback-row" data-astro-cid-7umwo7jf> <label for="notes" class="editorial-feedback-label" data-astro-cid-7umwo7jf>Note per la redazione</label> <textarea id="notes" name="notes" class="editorial-feedback-textarea"${addAttribute(3, "rows")} data-astro-cid-7umwo7jf></textarea> </div> <input type="hidden" name="wp_id"${addAttribute(wpId ?? "", "value")} data-astro-cid-7umwo7jf> <input type="hidden" name="title"${addAttribute(title, "value")} data-astro-cid-7umwo7jf> <input type="hidden" name="current_role"${addAttribute(currentRole ?? "", "value")} data-astro-cid-7umwo7jf> <input type="hidden" name="url"${addAttribute(url, "value")} data-astro-cid-7umwo7jf> <div class="editorial-feedback-row editorial-feedback-actions" data-astro-cid-7umwo7jf> <button type="submit" class="editorial-feedback-submit" data-astro-cid-7umwo7jf>Invia</button> <p id="feedback-status" class="editorial-feedback-status" hidden data-astro-cid-7umwo7jf></p> </div> </form> </aside>  `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/EditorialFeedback.astro", void 0);

const autoriStats = [
	{
		nome: "Redazione",
		slug: "redazione",
		count_articoli: 1802,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Cristina Tersigni",
		slug: "cristina-tersigni",
		count_articoli: 278,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Mariangela Bertolini",
		slug: "mariangela-bertolini",
		count_articoli: 205,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Giulia Galeotti",
		slug: "giulia-galeotti",
		count_articoli: 164,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Benedetta Mattei",
		slug: "benedetta-mattei",
		count_articoli: 104,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Claudio Cinus",
		slug: "claudio-cinus",
		count_articoli: 103,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Nicole Schulthes",
		slug: "nicole-schulthes",
		count_articoli: 82,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Natalia Livi",
		slug: "natalia-livi",
		count_articoli: 63,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Maria Teresa Mazzarotto",
		slug: "maria-teresa-mazzarotto",
		count_articoli: 60,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Jean Vanier",
		slug: "jean-vanier",
		count_articoli: 60,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Antonietta Pantone",
		slug: "antonietta-pantone",
		count_articoli: 46,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Matteo Cinti",
		slug: "matteo-cinti",
		count_articoli: 46,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Giovanni Grossi",
		slug: "giovanni-grossi",
		count_articoli: 41,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Sergio Sciascia",
		slug: "sergio-sciascia",
		count_articoli: 40,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Rita Massi",
		slug: "rita-massi",
		count_articoli: 40,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Laura Nardini",
		slug: "laura-nardini",
		count_articoli: 34,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Enrica Riera",
		slug: "enrica-riera",
		count_articoli: 31,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Huberta Pott",
		slug: "huberta-pott",
		count_articoli: 25,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Marie Hélène Mathieu",
		slug: "marie-helene-mathieu",
		count_articoli: 24,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Nicla Bettazzi",
		slug: "nicla-bettazzi",
		count_articoli: 23,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Henri Bissonier",
		slug: "henri-bissonier",
		count_articoli: 22,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Luis Sankalé",
		slug: "luis-sankale",
		count_articoli: 22,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Pennablù",
		slug: "pennablu",
		count_articoli: 22,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Lucia Bertolini",
		slug: "lucia-bertolini",
		count_articoli: 22,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Laura Coccia",
		slug: "laura-coccia",
		count_articoli: 20,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Vito Giannulo",
		slug: "vito-giannulo",
		count_articoli: 20,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Luciana Spigolon",
		slug: "luciana-spigolon",
		count_articoli: 17,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Serena Sillitto",
		slug: "serena-sillitto",
		count_articoli: 14,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Silvia Gusmano",
		slug: "silvia-gusmano",
		count_articoli: 14,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Monica Leggeri",
		slug: "monica-leggeri",
		count_articoli: 13,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Angela Grassi",
		slug: "angela-grassi",
		count_articoli: 12,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Olga Gammarelli",
		slug: "olga-gammarelli",
		count_articoli: 12,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Anna Cece",
		slug: "anna-cece",
		count_articoli: 11,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Manuela Bartesaghi",
		slug: "manuela-bartesaghi",
		count_articoli: 11,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Arianna Giuliano",
		slug: "arianna-giuliano",
		count_articoli: 11,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Marco Bove",
		slug: "marco-bove",
		count_articoli: 11,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Carlo Maria Martini",
		slug: "carlo-maria-martini",
		count_articoli: 10,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Rita Ozzimo",
		slug: "rita-ozzimo",
		count_articoli: 10,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Efrem Sardella",
		slug: "efrem-sardella",
		count_articoli: 9,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Marie-Odile Réthoré",
		slug: "marie-odile-rethore",
		count_articoli: 9,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Paul Gilbert",
		slug: "paul-gilbert",
		count_articoli: 8,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Silvia Camisasca",
		slug: "silvia-camisasca",
		count_articoli: 7,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Antonio Mazzarotto",
		slug: "antonio-mazzarotto",
		count_articoli: 7,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Stefano Di Franco",
		slug: "stefano-di-franco",
		count_articoli: 7,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Davide Passeri",
		slug: "davide-passeri",
		count_articoli: 7,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Maria Grazia Pennisi",
		slug: "maria-grazia-pennisi",
		count_articoli: 7,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Sophie Cluzel",
		slug: "sophie-cluzel",
		count_articoli: 6,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Flora Atlante",
		slug: "flora-atlante",
		count_articoli: 6,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Alessandro De Simone",
		slug: "alessandro-de-simone",
		count_articoli: 6,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Pietro Vetro",
		slug: "pietro-vetro",
		count_articoli: 6,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Elisabetta De Rino",
		slug: "elisabetta-de-rino",
		count_articoli: 6,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Valeria Levi della Vida",
		slug: "valeria-levi-della-vida",
		count_articoli: 6,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Don Stefano Buttinoni",
		slug: "don-stefano-buttinoni",
		count_articoli: 6,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Stefano Guarino",
		slug: "stefano-guarino",
		count_articoli: 6,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Annik Donelli",
		slug: "annik-donelli",
		count_articoli: 6,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Filippo Ascenzi",
		slug: "filippo-ascenzi",
		count_articoli: 6,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Sergio De Rino",
		slug: "sergio-de-rino",
		count_articoli: 6,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Michel Charpentier",
		slug: "michel-charpentier",
		count_articoli: 5,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Nanni Bertolini",
		slug: "nanni-bertolini",
		count_articoli: 5,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Lucia Pennisi",
		slug: "lucia-pennisi",
		count_articoli: 5,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Lucia Casella",
		slug: "lucia-casella",
		count_articoli: 5,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "André Roberti",
		slug: "andre-roberti",
		count_articoli: 5,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Francesco Bertolini",
		slug: "francesco-bertolini",
		count_articoli: 5,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Maria Grazia Romanini",
		slug: "maria-grazia-romanini",
		count_articoli: 4,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Lars Porsenna",
		slug: "lars-porsenna",
		count_articoli: 4,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Anna Maria de Rino",
		slug: "anna-maria-de-rino",
		count_articoli: 4,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Enrico Cattaneo",
		slug: "enrico-cattaneo",
		count_articoli: 4,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Guenda Malvezzi",
		slug: "guenda-malvezzi",
		count_articoli: 4,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Francesca Poleggi",
		slug: "francesca-poleggi",
		count_articoli: 4,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Liliana Ghiringhelli",
		slug: "liliana-ghiringhelli",
		count_articoli: 4,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Pierre Debergé",
		slug: "pierre-deberge",
		count_articoli: 4,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Melanie Castellani",
		slug: "melanie-castellani",
		count_articoli: 4,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Sophie Lutz",
		slug: "sophie-lutz",
		count_articoli: 4,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Delia Mitolo",
		slug: "delia-mitolo",
		count_articoli: 4,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Vito Palmisano",
		slug: "vito-palmisano",
		count_articoli: 4,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Niccolò Scarnato",
		slug: "niccolo-scarnato",
		count_articoli: 4,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Laura Cattaneo",
		slug: "laura-cattaneo",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Marta De Rino",
		slug: "marta-de-rino",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Andrea Lonardo",
		slug: "andrea-lonardo",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Patrick Thonon",
		slug: "patrick-thonon",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Lucina Spaccia",
		slug: "lucina-spaccia",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Silvia Tamberi",
		slug: "silvia-tamberi",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Florence Chatel",
		slug: "florence-chatel",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Emanuele Mendola",
		slug: "emanuele-mendola",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Larysa Grygoryeva",
		slug: "larysa-grygoryeva",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Angela Cusimano",
		slug: "angela-cusimano",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Maria Novella Pulieri",
		slug: "maria-novella-pulieri",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Paolo Tantaro",
		slug: "paolo-tantaro",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Isabella Gimmi",
		slug: "isabella-gimmi",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Luca Badetti",
		slug: "luca-badetti",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Antonella Bulgheroni",
		slug: "antonella-bulgheroni",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Ivana Perri",
		slug: "ivana-perri",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Cyrill Donille",
		slug: "cyrill-donille",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Rita Di Nale",
		slug: "rita-di-nale",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Stefano Pescosolido",
		slug: "stefano-pescosolido",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Stefano Artero",
		slug: "stefano-artero",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Père Christian Mahéas",
		slug: "pere-christian-maheas",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Grazia Felici",
		slug: "grazia-felici",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Tommaso Bertolini",
		slug: "tommaso-bertolini",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Antonio Piscitelli",
		slug: "antonio-piscitelli",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Matteo Mazzarotto",
		slug: "matteo-mazzarotto",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Stefano Marchetti",
		slug: "stefano-marchetti",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Cristina Ventura",
		slug: "cristina-ventura",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Francesco Gammarelli",
		slug: "francesco-gammarelli",
		count_articoli: 3,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Manrica Baldini",
		slug: "manrica-baldini",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Giovanni Mazzarotto",
		slug: "giovanni-mazzarotto",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Giampaolo Mattei",
		slug: "giampaolo-mattei",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Cristina Campanini",
		slug: "cristina-campanini",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Loredana Moretti",
		slug: "loredana-moretti",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Federica Aliano",
		slug: "federica-aliano",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Adriano Ercolani",
		slug: "adriano-ercolani",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Andrea Guglielmino",
		slug: "andrea-guglielmino",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Armando D'Amato",
		slug: "armando-d-amato",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Boris Sollazzo",
		slug: "boris-sollazzo",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Emanuele Rauco",
		slug: "emanuele-rauco",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Gabriele Niola",
		slug: "gabriele-niola",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Mario Collino",
		slug: "mario-collino",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Jacques Labrousse",
		slug: "jacques-labrousse",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "P. Noel Simard",
		slug: "p-noel-simard",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Patrizia Stacconi",
		slug: "patrizia-stacconi",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Salvatore Boccaccio",
		slug: "salvatore-boccaccio",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Alessandra Conicchioli",
		slug: "alessandra-conicchioli",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Alessandra Del Duca",
		slug: "alessandra-del-duca",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Agnés Auschitzky",
		slug: "agnes-auschitzky",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Ilaria Pennacchini",
		slug: "ilaria-pennacchini",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Marie-Sylvie Richard",
		slug: "marie-sylvie-richard",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Stefano Nasuti",
		slug: "stefano-nasuti",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Paolo Catapano",
		slug: "paolo-catapano",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Nunzia Giancola",
		slug: "nunzia-giancola",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Alessandra Moraca",
		slug: "alessandra-moraca",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Padre Isaac Martinez",
		slug: "padre-isaac-martinez",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Lorenzo Cerutti",
		slug: "lorenzo-cerutti",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Giusy Nocca",
		slug: "giusy-nocca",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Paolo Nardini",
		slug: "paolo-nardini",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Elisa De Felice",
		slug: "elisa-de-felice",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Marco Bersani",
		slug: "marco-bersani",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Giovanni Adomi Braccesi",
		slug: "giovanni-adomi-braccesi",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Padre Joseph Mihelcic s.j.",
		slug: "padre-joseph-mihelcic-s-j",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Gianfranco Ravasi",
		slug: "gianfranco-ravasi",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Valeria Adorni Braccesi",
		slug: "valeria-adorni-braccesi",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Filippo Fantozzi",
		slug: "filippo-fantozzi",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Ghislain du Chéné",
		slug: "ghislain-du-chene",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Marie Claude Fabre",
		slug: "marie-claude-fabre",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Carlo Gazzano",
		slug: "carlo-gazzano",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Luisa Spada",
		slug: "luisa-spada",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Beatrice Ghislandi",
		slug: "beatrice-ghislandi",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Anna Maria Canonico",
		slug: "anna-maria-canonico",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Benoit Malveaux",
		slug: "benoit-malveaux",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Adriana Duci",
		slug: "adriana-duci",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Anna Testa",
		slug: "anna-testa",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Alessandra Zezza",
		slug: "alessandra-zezza",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Don Paolo",
		slug: "don-paolo",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Paolo Bertolini",
		slug: "paolo-bertolini",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Benedetta Bertolini",
		slug: "benedetta-bertolini",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Giada Di Vecchio",
		slug: "giada-di-vecchio",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Andrea Posa",
		slug: "andrea-posa",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Giulia Alberico",
		slug: "giulia-alberico",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Padre Joseph Larsen",
		slug: "padre-joseph-larsen",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Fausta Guglielmi",
		slug: "fausta-guglielmi",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Giovanni Maria Flick",
		slug: "giovanni-maria-flick",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Salvatore Anastasi",
		slug: "salvatore-anastasi",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Mara Martelli",
		slug: "mara-martelli",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Davide Del Duca",
		slug: "davide-del-duca",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Nadia Pastori",
		slug: "nadia-pastori",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Cyrill Douillet",
		slug: "cyrill-douillet",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Lorraine McCrary",
		slug: "lorraine-mccrary",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Vittore Mariani",
		slug: "vittore-mariani",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Suor Ida Maria",
		slug: "suor-ida-maria",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Gaia Valmarin",
		slug: "gaia-valmarin",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Carla Gaviraghi",
		slug: "carla-gaviraghi",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Daniele Cogliandro",
		slug: "daniele-cogliandro",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Carlo Maria Fornari",
		slug: "carlo-maria-fornari",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Elisabetta Aglianò",
		slug: "elisabetta-agliano",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Francesca Mancini",
		slug: "francesca-mancini",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Giovanni Vergani",
		slug: "giovanni-vergani",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Lucio Cammarota",
		slug: "lucio-cammarota",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Giorgia Fontani",
		slug: "giorgia-fontani",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Antonella B.",
		slug: "antonella-b",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Benny",
		slug: "benny",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Ola Gurevitch",
		slug: "ola-gurevitch",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Vanna Rossani",
		slug: "vanna-rossani",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Suor Veronica Amata Donatello",
		slug: "suor-veronica-amata-donatello",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Gérard Daucourt",
		slug: "gerard-daucourt",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Daniela Guglietta",
		slug: "daniela-guglietta",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Maria Teresa Rendina",
		slug: "maria-teresa-rendina",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Angela Gattulli",
		slug: "angela-gattulli",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Valentina Camomilla",
		slug: "valentina-camomilla",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Valentina Calabresi",
		slug: "valentina-calabresi",
		count_articoli: 2,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Don Tonino Bello",
		slug: "don-tonino-bello",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Vivi Licciuli",
		slug: "vivi-licciuli",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Anna Aluffi Pentini",
		slug: "anna-aluffi-pentini",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Giovanni Iannò",
		slug: "giovanni-ianno",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Flaminia Cabras",
		slug: "flaminia-cabras",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Marta Tersigni",
		slug: "marta-tersigni",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Valeria Antonucci",
		slug: "valeria-antonucci",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Luci0 Colombaro",
		slug: "luci0-colombaro",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Giuliana Siclari",
		slug: "giuliana-siclari",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Giovanni Zaninello",
		slug: "giovanni-zaninello",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Claudio Moriggia",
		slug: "claudio-moriggia",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Giovanni Intini",
		slug: "giovanni-intini",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Rosita Daddato",
		slug: "rosita-daddato",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Gianni Verni",
		slug: "gianni-verni",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Silvia Freschi",
		slug: "silvia-freschi",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Camille Proffit",
		slug: "camille-proffit",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Marta Pensi",
		slug: "marta-pensi",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "A.A.",
		slug: "a-a",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Emanuele Attanasio",
		slug: "emanuele-attanasio",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Mascia Lenzi",
		slug: "mascia-lenzi",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Paola Gini",
		slug: "paola-gini",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Giulia Cirillo",
		slug: "giulia-cirillo",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Elzbieta Steczkiewicz",
		slug: "elzbieta-steczkiewicz",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Laura Broccoli",
		slug: "laura-broccoli",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Vincenzo e Irene Ruisi",
		slug: "vincenzo-e-irene-ruisi",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Michel Lemay",
		slug: "michel-lemay",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Nora Buccheri",
		slug: "nora-buccheri",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Ruggero Leonardi",
		slug: "ruggero-leonardi",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Nicolle Carré",
		slug: "nicolle-carre",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Cordula Neuhaus",
		slug: "cordula-neuhaus",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Jane Gross",
		slug: "jane-gross",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Arnaud Franc",
		slug: "arnaud-franc",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Solange Fanc",
		slug: "solange-fanc",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Mariano S. Pergola",
		slug: "mariano-s-pergola",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Don Virginio Colmegna",
		slug: "don-virginio-colmegna",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Marta De Rino e Eleonora Secchi",
		slug: "marta-de-rino-e-eleonora-secchi",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Simona Greco",
		slug: "simona-greco",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Giovanni Solaro",
		slug: "giovanni-solaro",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Gianna Maria",
		slug: "gianna-maria",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Claudio Roncoroni",
		slug: "claudio-roncoroni",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Cecilia Cattaneo Barbieri",
		slug: "cecilia-cattaneo-barbieri",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Cristina Lo Jacono",
		slug: "cristina-lo-jacono",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Elvira Zaccagnino",
		slug: "elvira-zaccagnino",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Andrea Zamperoni",
		slug: "andrea-zamperoni",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Gianluca Giardini",
		slug: "gianluca-giardini",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Sara Mc Allister",
		slug: "sara-mc-allister",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Maurizio Pilone",
		slug: "maurizio-pilone",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Vittorio Scelzo",
		slug: "vittorio-scelzo",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Antonello Damiani",
		slug: "antonello-damiani",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Maria Valeria Spinola",
		slug: "maria-valeria-spinola",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Pierina Formiconi",
		slug: "pierina-formiconi",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Fabio Bronzini",
		slug: "fabio-bronzini",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Gruppo Cesano Boscone",
		slug: "gruppo-cesano-boscone",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Fabienne Clinquart",
		slug: "fabienne-clinquart",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Marie-Françoise (Friquette) Heyndrickx",
		slug: "marie-francoise-friquette-heyndrickx",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Davide",
		slug: "davide",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Padre Mario Marazzi",
		slug: "padre-mario-marazzi",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Mauro Santoro",
		slug: "mauro-santoro",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Associazione Amici di Simone",
		slug: "associazione-amici-di-simone",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Dario Piersanti",
		slug: "dario-piersanti",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Vittoria Episcopello",
		slug: "vittoria-episcopello",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Betty Collino",
		slug: "betty-collino",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Rosalba Di Marco",
		slug: "rosalba-di-marco",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Cristobal Clavijo Zàrate",
		slug: "cristobal-clavijo-zarate",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Carole Irwin",
		slug: "carole-irwin",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Valentina Mari",
		slug: "valentina-mari",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Vittorio Paoli",
		slug: "vittorio-paoli",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Claudia Noviello",
		slug: "claudia-noviello",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Andrea Cesarini",
		slug: "andrea-cesarini",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Emanuele Sapore",
		slug: "emanuele-sapore",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Lorenzo Portento",
		slug: "lorenzo-portento",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Cristina Marchese",
		slug: "cristina-marchese",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Sergio Zini",
		slug: "sergio-zini",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Cristina Cangemi Matteo Tobanelli",
		slug: "cristina-cangemi-matteo-tobanelli",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Tiziana D'Ambrosio",
		slug: "tiziana-d-ambrosio",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Daniele Cabras",
		slug: "daniele-cabras",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Edda e Maria Teresa",
		slug: "edda-e-maria-teresa",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Cristiana Vigli",
		slug: "cristiana-vigli",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Bernard Provoust",
		slug: "bernard-provoust",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Maria Amelia",
		slug: "maria-amelia",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Jean Marie Petitclerc",
		slug: "jean-marie-petitclerc",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Roger Salbreux",
		slug: "roger-salbreux",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Jacqueline e Henri Faivre",
		slug: "jacqueline-e-henri-faivre",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Marina Vigliar",
		slug: "marina-vigliar",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Carla Fonzi Klieman",
		slug: "carla-fonzi-klieman",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Charlotte Lernount",
		slug: "charlotte-lernount",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Elisa Sturlese",
		slug: "elisa-sturlese",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Isabella Corsini",
		slug: "isabella-corsini",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Immacolata Casullo",
		slug: "immacolata-casullo",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Chiara Gatti",
		slug: "chiara-gatti",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Annamaria Manfucci",
		slug: "annamaria-manfucci",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Dott.ssa Maria Teresa Puerto",
		slug: "dott-ssa-maria-teresa-puerto",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Tina Turrini",
		slug: "tina-turrini",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Dorota Swat",
		slug: "dorota-swat",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Donatella Marazzini",
		slug: "donatella-marazzini",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Francesca De Rino",
		slug: "francesca-de-rino",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Gabriella Boyer",
		slug: "gabriella-boyer",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Giuseppe Bertolini",
		slug: "giuseppe-bertolini",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Giorgiana Tinazzo",
		slug: "giorgiana-tinazzo",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Paolo Salvini",
		slug: "paolo-salvini",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Angelo Colacino",
		slug: "angelo-colacino",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Monica Boyer",
		slug: "monica-boyer",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Bianca De Pascalis",
		slug: "bianca-de-pascalis",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Betrice Pezzoli",
		slug: "betrice-pezzoli",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Vittoria Lombardo",
		slug: "vittoria-lombardo",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Franca Forti Bulferi",
		slug: "franca-forti-bulferi",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Elmira Gani",
		slug: "elmira-gani",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Caterina Bordon",
		slug: "caterina-bordon",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Padre Nicolas Buttet",
		slug: "padre-nicolas-buttet",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Ezia Schiavone",
		slug: "ezia-schiavone",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Stefano Atzeni",
		slug: "stefano-atzeni",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Enrica Cofano",
		slug: "enrica-cofano",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Gianluigi Visentini",
		slug: "gianluigi-visentini",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Maria Teresa Mosconi Straulino",
		slug: "maria-teresa-mosconi-straulino",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Italia Valle",
		slug: "italia-valle",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Roberto Bertin",
		slug: "roberto-bertin",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Francesco Iellamo",
		slug: "francesco-iellamo",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Francesca Cabrini",
		slug: "francesca-cabrini",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Adriana Lunghi",
		slug: "adriana-lunghi",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Domenico e Filippo Pescosolido",
		slug: "domenico-e-filippo-pescosolido",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Paola Angeloro",
		slug: "paola-angeloro",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Madre Pantanella",
		slug: "madre-pantanella",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Padre Luciano Larivera",
		slug: "padre-luciano-larivera",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Stefano Desmazieres",
		slug: "stefano-desmazieres",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Corrado Dastoli",
		slug: "corrado-dastoli",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Tana Pelagallo",
		slug: "tana-pelagallo",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Giancarla Ferrari",
		slug: "giancarla-ferrari",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Roberta Tarantino",
		slug: "roberta-tarantino",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Maria Varoli",
		slug: "maria-varoli",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Elena Bernasconi",
		slug: "elena-bernasconi",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Valentina Gallo",
		slug: "valentina-gallo",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Don Giuseppe Alcamo",
		slug: "don-giuseppe-alcamo",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Michele Vulcan",
		slug: "michele-vulcan",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Daniela Vinazza",
		slug: "daniela-vinazza",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Pere Bernard-Marie Geffroy",
		slug: "pere-bernard-marie-geffroy",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "AiOel Intelligenza Artificiale",
		slug: "aioel-intelligenza-artificiale",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Christine Anglès",
		slug: "christine-angles",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Gianni Carparelli",
		slug: "gianni-carparelli",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Carla Waked",
		slug: "carla-waked",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Myrna Hayek",
		slug: "myrna-hayek",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "G.",
		slug: "g",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Federica R. Poleggi",
		slug: "federica-r-poleggi",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Francesca Giannulo",
		slug: "francesca-giannulo",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Lena Botta",
		slug: "lena-botta",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Renata De Pascale",
		slug: "renata-de-pascale",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Anna Rita Cedroni",
		slug: "anna-rita-cedroni",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Yvette Bonvin",
		slug: "yvette-bonvin",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Mons. Alberto G. Bochatey",
		slug: "mons-alberto-g-bochatey",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Mons. Nunzio Galantino",
		slug: "mons-nunzio-galantino",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Pier Giorgio Trancossi",
		slug: "pier-giorgio-trancossi",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Teresita Frachey",
		slug: "teresita-frachey",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Maria Ilaria Di Bernardo",
		slug: "maria-ilaria-di-bernardo",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Monica Mazzucco",
		slug: "monica-mazzucco",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Roberto Brandinelli",
		slug: "roberto-brandinelli",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Don Antonino",
		slug: "don-antonino",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Valeria Spinola",
		slug: "valeria-spinola",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Alexandre Jollien",
		slug: "alexandre-jollien",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Cristina Pesci",
		slug: "cristina-pesci",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Gianni Marmorini",
		slug: "gianni-marmorini",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Raul Izquierdo",
		slug: "raul-izquierdo",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	},
	{
		nome: "Rosa Maria Sonzini",
		slug: "rosa-maria-sonzini",
		count_articoli: 1,
		bio_breve: "Autore di Ombre e Luci",
		foto: "/images/authors/default.png"
	}
];

const $$Astro$1 = createAstro();
const $$LeggiAnche = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$LeggiAnche;
  const { articolo } = Astro2.props;
  if (!articolo) return;
  const href = `/blog/${articolo.slug}`;
  const image = getArticoloCopertinaSrc(articolo) ?? "/placeholder/ph-1.jpg";
  const _excerpt = articolo.sottotitolo?.trim() || articolo.seo_description?.trim() || null;
  const sottotitolo = _excerpt && _excerpt !== articolo.titolo?.trim() ? _excerpt : null;
  return renderTemplate`${maybeRenderHead()}<aside class="leggi-anche" data-astro-cid-3mqzycu7> <a${addAttribute(href, "href")} class="leggi-anche-link" data-astro-cid-3mqzycu7> <span class="leggi-anche-label" data-astro-cid-3mqzycu7>Leggi anche</span> <div class="leggi-anche-inner" data-astro-cid-3mqzycu7> ${image && renderTemplate`<div class="leggi-anche-img" data-astro-cid-3mqzycu7> <img${addAttribute(image, "src")}${addAttribute(articolo.titolo, "alt")} loading="lazy" data-astro-cid-3mqzycu7> </div>`} <div class="leggi-anche-text" data-astro-cid-3mqzycu7> <p class="leggi-anche-title" data-astro-cid-3mqzycu7>${articolo.titolo}</p> ${sottotitolo && renderTemplate`<p class="leggi-anche-excerpt" data-astro-cid-3mqzycu7>${sottotitolo}</p>`} </div> </div> </a> </aside> `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/LeggiAnche.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a, _b;
const $$Astro = createAstro();
const prerender = false;
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$;
  const locale = getLangFromUrl(Astro2.url.pathname);
  const totalAutori = Array.isArray(autoriStats) ? autoriStats.length : 0;
  const creds = directusCredsFromAstroLocals(Astro2.locals);
  const rawSlug = Astro2.params.slug ?? "";
  const slug = rawSlug.replace(/\/$/, "");
  let articolo;
  try {
    articolo = await getArticoloBySlug(slug, creds);
  } catch (e) {
    console.error("[blog/[...slug].astro] fetch error:", e);
    articolo = null;
  }
  if (!articolo) {
    return new Response("Not found", { status: 404 });
  }
  Astro2.response.headers.set("Cache-Control", "s-maxage=86400, stale-while-revalidate=3600");
  let correlatiMap = {};
  try {
    const correlatiRes = await fetch(`${Astro2.url.origin}/correlati.json`);
    if (correlatiRes.ok) correlatiMap = await correlatiRes.json();
  } catch (e) {
    console.warn("[blog/[...slug].astro] correlati.json fetch failed:", e);
  }
  const correlatiSlugsRaw = correlatiMap[articolo.slug] ?? [];
  const correlatiArticoli = await getArticoliBySlugList(correlatiSlugsRaw.slice(0, 10), creds).catch(() => []);
  function formatDateItalian(date) {
    return new Intl.DateTimeFormat("it-IT", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(date);
  }
  function generateAuthorSlug(name) {
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  function generateIssueSlug(issueNumber2) {
    return issueNumber2.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  }
  function calculateReadingTimeFromHtml(html) {
    if (!html) return 3;
    const textOnly = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const wordCount = textOnly.split(/\s+/).filter((w) => w.length > 0).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }
  const articleTitle = articolo.titolo;
  const articleDate = articolo.data_pubblicazione ? new Date(articolo.data_pubblicazione) : /* @__PURE__ */ new Date();
  const autoreCompleto = articolo.autore;
  const autoreName = autoreCompleto?.nome_completo ?? "Autore sconosciuto";
  const authorSlug = generateAuthorSlug(autoreName);
  const authorBioHtml = autoreCompleto?.bio_html?.trim() || null;
  const isJeanVanier = autoreCompleto?.slug === "jean-vanier" || autoreName.toLowerCase().includes("jean vanier");
  const authorFotoId = autoreCompleto?.foto?.id ?? null;
  const authorImagePath = authorFotoId ? getAutoreImageUrl(authorFotoId) : `/assets/authors/${authorSlug}.jpg`;
  const authorBio = authorBioHtml;
  const readingTime = calculateReadingTimeFromHtml(articolo.corpo);
  const slugToArticolo = Object.fromEntries(correlatiArticoli.map((a) => [a.slug, a]));
  function splitCorpoAfterNthParagraph(html, n) {
    let count = 0;
    let idx = 0;
    while (count < n && idx < html.length) {
      const next = html.indexOf("</p>", idx);
      if (next === -1) break;
      idx = next + 4;
      count++;
    }
    if (count < n) return [html, ""];
    return [html.slice(0, idx), html.slice(idx)];
  }
  function extractYouTubeId(url) {
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  }
  function processEmbeds(html) {
    let out = html;
    let hasInstagram2 = false;
    out = out.replace(
      /<p>\s*(https?:\/\/(?:youtu\.be\/|(?:www\.)?youtube\.com\/watch[^\s<"]*)[^\s<"]*)\s*<\/p>/gi,
      (_, url) => {
        const id = extractYouTubeId(url);
        if (!id) return `<p>${url}</p>`;
        return `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${id}" title="Video YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
      }
    );
    if (/<blockquote[^>]+instagram/i.test(out)) {
      hasInstagram2 = true;
      out = out.replace(
        /(<blockquote\b(?![^>]*class)[^>]*)(data-instgrm-permalink)/gi,
        '$1class="instagram-media" $2'
      );
    }
    return { html: out, hasInstagram: hasInstagram2 };
  }
  const rawCorpo = articolo.corpo ?? "";
  const { html: processedCorpo, hasInstagram } = processEmbeds(rawCorpo);
  const leggiAncheSlug = articolo.lang !== "en" ? correlatiSlugsRaw.find((s) => {
    const bCorrelati = correlatiMap[s] ?? [];
    return bCorrelati[0] !== articolo.slug;
  }) ?? null : null;
  const leggiAncheArticolo = leggiAncheSlug ? slugToArticolo[leggiAncheSlug] ?? null : null;
  const [corpoPart1, corpoPart2] = leggiAncheArticolo && processedCorpo ? splitCorpoAfterNthParagraph(processedCorpo, 3) : [processedCorpo, ""];
  const issueNumber = articolo.numero_rivista?.id_numero ?? null;
  const issueSlug = issueNumber ? generateIssueSlug(issueNumber) : null;
  const issueLink = issueSlug ? `/archivio/${issueSlug}` : null;
  const articleImageRaw = getArticoloCopertinaSrc(articolo);
  const articleImage = articolo.immagine_copertina?.id ? articleImageRaw : getPlaceholder(articolo.slug ?? "").src;
  const explicitSubtitle = articolo.sottotitolo?.trim() || articolo.seo_description?.trim() || null;
  const heroCaption = articolo.didascalia_copertina?.trim() || null;
  const metaDescription = explicitSubtitle || articolo.seo_description ? (explicitSubtitle || articolo.seo_description).substring(0, 160).replace(/\s+/g, " ").trim() : `${articleTitle} - Articolo pubblicato su Ombre e Luci`;
  const categoryDisplay = getThemeLabel(articolo);
  const categorySlug = getCategorySlugForArticle(articolo);
  const categoryLink = categorySlug ? `/categoria/${categorySlug}` : null;
  const currentLabels = getLabels([], articolo);
  const formaDisplay = currentLabels.formal !== "Articolo" ? currentLabels.formal : null;
  const hasIssue = issueNumber != null && String(issueNumber).trim() !== "";
  const showPubblicatoOnline = !hasIssue;
  const { ruolo_editoriale } = getMegaclusterForArticle(articolo);
  let roleLabel = null;
  let roleClassName = "";
  if (ruolo_editoriale === "portante") {
    roleLabel = "Portante";
    roleClassName = " article-badge-role--portante";
  } else if (ruolo_editoriale === "strutturale") {
    roleLabel = "Strutturale";
    roleClassName = " article-badge-role--strutturale";
  } else if (ruolo_editoriale === "laterale") {
    roleLabel = "Laterale";
    roleClassName = " article-badge-role--laterale";
  } else if (ruolo_editoriale === "trasversale") {
    roleLabel = "Trasversale";
    roleClassName = " article-badge-role--trasversale";
  }
  const pdfUrl = articolo.numero_rivista?.pdf_archive_url ?? null;
  const isTranslation = articolo.lang === "en";
  const isCurrentEn = articolo.lang === "en";
  const currentWpIdClean = String(articolo.wp_id ?? "");
  const currentSlug = articolo.slug;
  const alternateItem = articolo.articolo_traduzione ?? null;
  const alternateArticleUrl = alternateItem ? `/blog/${alternateItem.slug}` : null;
  const wpIdToSlugMap = {};
  for (const a of correlatiArticoli) {
    if (a.wp_id && a.slug) wpIdToSlugMap[a.wp_id] = a.slug;
  }
  const inContentRelatedMap = {};
  for (const a of correlatiArticoli) {
    const imgUrl = getArticoloCopertinaSrc(a);
    const lang = a.lang;
    const isItalian = lang !== "en";
    const category = getCategorySlugForArticle(a) ?? null;
    inContentRelatedMap[a.slug] = {
      title: a.titolo,
      image: imgUrl,
      excerpt: a.sottotitolo?.trim() || null,
      href: `/blog/${a.slug}`,
      category,
      lang,
      isItalian
    };
  }
  const correlatiSlugs = correlatiSlugsRaw;
  const relatedArticles = (() => {
    const umap = correlatiSlugs.filter((s) => s !== leggiAncheSlug).map((s) => slugToArticolo[s]).filter((a) => !!a && a.id !== articolo.id && (isCurrentEn ? a.lang === "en" : a.lang !== "en")).slice(0, 3);
    return umap.map((a) => {
      const labels = getLabels([], a);
      const { ruolo_editoriale: relRuolo } = getMegaclusterForArticle(a);
      return {
        title: a.titolo,
        author: a.autore?.nome_completo ?? "Autore sconosciuto",
        date: a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date(),
        issue: a.numero_rivista?.id_numero ?? null,
        slug: a.slug,
        image: getArticoloCopertinaSrc(a),
        categoriaMenu: getThemeLabel(a) ?? null,
        forma: labels.formal,
        ruoloEditoriale: relRuolo
      };
    });
  })();
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": articleTitle, "description": metaDescription, "ogImage": articleImage, "ogType": "article", "lang": articolo.lang === "en" ? "en" : "it", "noindex": true, "alternateArticleUrl": alternateArticleUrl, "alternates": [
    { lang: articolo.lang === "en" ? "en" : "it", url: Astro2.url.href },
    ...alternateArticleUrl ? [{ lang: articolo.lang === "en" ? "it" : "en", url: alternateArticleUrl }] : []
  ], "data-astro-cid-7jjqptxk": true }, { "default": async ($$result2) => renderTemplate(_b || (_b = __template(["  ", '<main class="site-main" data-astro-cid-7jjqptxk>  <div class="reading-progress" id="reading-progress" data-astro-cid-7jjqptxk></div> <div class="article-container" data-astro-cid-7jjqptxk>  <nav class="breadcrumbs" data-astro-cid-7jjqptxk> <a', " data-astro-cid-7jjqptxk>", "</a> ", ' </nav>  <header class="article-header-wrapper" data-astro-cid-7jjqptxk>  ', ' <h1 class="article-title" data-astro-cid-7jjqptxk>', "</h1>  ", '  <div class="article-meta" data-astro-cid-7jjqptxk> <div class="article-meta-item" data-astro-cid-7jjqptxk> <img', "", ` class="article-meta-author-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" loading="lazy" data-astro-cid-7jjqptxk> <div class="article-meta-author-placeholder" style="display: none;" data-astro-cid-7jjqptxk> `, " </div> <a", ' class="author-link" data-astro-cid-7jjqptxk>', '</a> </div> <div class="article-meta-item" data-astro-cid-7jjqptxk> ', ' </div> <div class="article-meta-item" data-astro-cid-7jjqptxk> ', " ", " </div> ", ' </div> </header>  <div class="article-hero-wrapper" data-astro-cid-7jjqptxk> <div class="article-hero-image-wrapper" data-astro-cid-7jjqptxk> <img', "", ' class="article-image" loading="eager" decoding="async" fetchpriority="high" data-copertina-fallback', " data-astro-cid-7jjqptxk> ", " </div> </div>  ", " ", '  <div class="social-sticky" id="social-sticky" data-astro-cid-7jjqptxk> <div class="social-sticky-inner" data-astro-cid-7jjqptxk> <a', ' target="_blank" rel="noopener noreferrer" class="social-link facebook" aria-label="Condividi su Facebook" data-astro-cid-7jjqptxk> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" data-astro-cid-7jjqptxk> <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" data-astro-cid-7jjqptxk></path> </svg> </a> <a', ' target="_blank" rel="noopener noreferrer" class="social-link twitter" aria-label="Condividi su X (Twitter)" data-astro-cid-7jjqptxk> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" data-astro-cid-7jjqptxk> <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" data-astro-cid-7jjqptxk></path> </svg> </a> <a', ' target="_blank" rel="noopener noreferrer" class="social-link whatsapp" aria-label="Condividi su WhatsApp" data-astro-cid-7jjqptxk> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" data-astro-cid-7jjqptxk> <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" data-astro-cid-7jjqptxk></path> </svg> </a> <a', ' target="_blank" rel="noopener noreferrer" class="social-link linkedin" aria-label="Condividi su LinkedIn" data-astro-cid-7jjqptxk> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" data-astro-cid-7jjqptxk> <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" data-astro-cid-7jjqptxk></path> </svg> </a> <a', ' class="social-link email" aria-label="Invia via email" data-astro-cid-7jjqptxk> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" data-astro-cid-7jjqptxk> <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" data-astro-cid-7jjqptxk></path> </svg> </a> <a href="#" class="social-link copy-link" aria-label="Copia link"', ' data-astro-cid-7jjqptxk> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" data-astro-cid-7jjqptxk> <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" data-astro-cid-7jjqptxk></path> </svg> </a> </div> </div>  <div class="article-content-wrapper" data-astro-cid-7jjqptxk> <div class="article-content" id="article-content" data-astro-cid-7jjqptxk> ', " <div data-astro-cid-7jjqptxk>", "</div> ", " ", ' </div>  <div class="author-bio-section" data-astro-cid-7jjqptxk> <div class="author-bio-wrapper" data-astro-cid-7jjqptxk> <div class="author-bio-avatar" data-astro-cid-7jjqptxk> <img', "", ` class="author-bio-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" loading="lazy" data-astro-cid-7jjqptxk> <div class="author-bio-placeholder" style="display: none;" data-astro-cid-7jjqptxk> `, ' </div> </div> <div class="author-bio-content" data-astro-cid-7jjqptxk> <h3 class="author-bio-name" data-astro-cid-7jjqptxk> <a', ' class="author-bio-link" data-astro-cid-7jjqptxk> ', ' </a> </h3> <div class="author-bio-text" data-astro-cid-7jjqptxk> ', ' </div> <p class="author-bio-total" data-astro-cid-7jjqptxk> ', ' <a href="/autori" data-astro-cid-7jjqptxk>', " ", "</a> </p> </div> </div> </div> ", ' </div>  <div class="floating-widget" id="floating-widget" data-astro-cid-7jjqptxk> <button class="close-btn" id="close-widget"', " data-astro-cid-7jjqptxk>\xD7</button> <h4 data-astro-cid-7jjqptxk>", "</h4> ", " ", " <a", ' class="widget-link" data-astro-cid-7jjqptxk>', "</a> </div>  ", " ", '  <details class="debug-section" hidden data-astro-cid-7jjqptxk> <summary style="cursor: pointer; color: var(--text-secondary); font-size: 0.85rem; margin-top: 2rem; padding: 0.5rem;" data-astro-cid-7jjqptxk>\n\u{1F50D} Debug: Dati articolo\n</summary> <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.75rem; margin-top: 0.5rem;" data-astro-cid-7jjqptxk>', '\n        </pre> <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.75rem; margin-top: 0.5rem;" data-astro-cid-7jjqptxk>ID: ', "\nSlug: ", '\n        </pre> </details> <section class="article-nav-section" aria-label="Navigazione" data-astro-cid-7jjqptxk> <a', ' class="back-link" data-astro-cid-7jjqptxk>\u2190 ', "</a> </section> </div> </main> ", "<script>(function(){", `
      window.__BLOG_PAGE_DATA__ = { wpIdToSlugMap, inContentRelatedMap, currentSlug, readAlsoLabel, alternateArticleUrl, currentWpIdClean };
    })();<\/script> <script>
      (function() {
        var data = window.__BLOG_PAGE_DATA__;
        if (!data) return;
        var wpIdToSlugMap = data.wpIdToSlugMap || {};
        var inContentRelatedMap = data.inContentRelatedMap || {};
        var currentSlug = data.currentSlug;
        var readAlsoLabel = data.readAlsoLabel || 'Leggi anche';
        function getContainer() {
          return document.querySelector('article') || document.querySelector('.prose') || document.body;
        }
        function getParagraphs(container) {
          if (!container) return [];
          return Array.from(container.children || []);
        }
        var readAlsoInserted = false;
        function getSlugFromHref(href) {
          if (!href) return null;
          var wpMatch = href.match(/[?&]p=(\\d+)/);
          if (wpMatch && wpIdToSlugMap) {
            var wpId = parseInt(wpMatch[1], 10);
            return wpIdToSlugMap[wpId] || null;
          }
          try {
            var url = new URL(href, window.location.origin);
            var segments = url.pathname.split('/').filter(Boolean);
            var blogIndex = segments.indexOf('blog');
            if (blogIndex !== -1 && segments.length > blogIndex + 1) return segments.slice(blogIndex + 1).join('/');
            if (segments.length > 0) return segments[segments.length - 1];
          } catch (e) {}
          return null;
        }
        function buildRelatedCard(slug, meta) {
          var hrefFinal = meta.href || '/blog/' + slug;
          var safeTitle = (meta.title || '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
          var safeExcerpt = (meta.excerpt || '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
          var article = document.createElement('article');
          article.className = 'incontent-related-card';
          article.innerHTML = '<a href="' + hrefFinal + '" class="incontent-related-link"><span class="incontent-related-label">' + readAlsoLabel + '</span><div class="incontent-related-image-wrapper"><img src="' + meta.image + '" alt="' + safeTitle + '" loading="lazy" onerror="this.onerror=null;this.src=\\'/images/placeholder-copertina.svg\\'" /></div><div class="incontent-related-content"><h4 class="incontent-related-title">' + safeTitle + '</h4>' + (safeExcerpt ? '<p class="incontent-related-excerpt">' + safeExcerpt + '</p>' : '') + '</div></a>';
          return article;
        }
        function removeOldRelatedSections() {
          var root = getContainer();
          if (!root) return;
          var oldSectionTitles = ['Articoli', 'Editoriale', 'Rubriche', 'Libri'];
          var children = Array.from(root.children);
          var lastThree = children.slice(-3);
          root.querySelectorAll('h4').forEach(function(h4) {
            // Bug 2 fix: rimuovi solo se l'h4 \xE8 tra gli ultimi 3 figli diretti del container
            var isNearEnd = lastThree.includes(h4) || lastThree.some(function(el) { return el.contains(h4); });
            if (!isNearEnd) return;
            var text = (h4.textContent || '').trim();
            if (oldSectionTitles.some(function(t) { return text === t || text.indexOf(t) !== -1 || text.endsWith(t); })) {
              var next = h4.nextElementSibling;
              while (next) {
                var toRemove = next;
                next = next.nextElementSibling;
                toRemove.remove();
              }
              h4.remove();
            }
          });
        }
        function insertReadAlsoBox() {
          if (readAlsoInserted || !inContentRelatedMap) return;
          if (document.querySelector('.incontent-related-card')) return;
          var container = getContainer();
          if (!container) return;
          var currentMeta = currentSlug ? inContentRelatedMap[currentSlug] : null;
          var currentCategory = currentMeta && currentMeta.category ? currentMeta.category : null;
          var allEntries = Object.entries(inContentRelatedMap);
          var candidates = allEntries.filter(function(entry) {
            var slug = entry[0], meta = entry[1];
            if (slug === currentSlug) return false;
            if (!meta || meta.isItalian === false) return false;
            if (currentCategory && meta.category) return meta.category === currentCategory;
            return true;
          });
          if (currentCategory && candidates.length === 0) {
            candidates = allEntries.filter(function(entry) {
              if (entry[0] === currentSlug) return false;
              return !!entry[1] && entry[1].isItalian !== false;
            });
          }
          if (!candidates.length) return;
          var randomIndex = Math.floor(Math.random() * candidates.length);
          var chosenSlug = candidates[randomIndex][0];
          var box = document.createElement('div');
          box.className = 'read-also-box';
          box.dataset.slug = chosenSlug;
          // Bug 3 fix: inserisci dopo il 3\xB0 paragrafo <p> diretto, non il 2\xB0 figlio generico
          var paragraphs = Array.from(container.querySelectorAll(':scope > p'));
          if (!paragraphs.length) return;
          var insertAfter = paragraphs[2] || paragraphs[paragraphs.length - 1];
          insertAfter.insertAdjacentElement('afterend', box);
          readAlsoInserted = true;
        }
        function enhanceReadAlsoBoxes() {
          if (!inContentRelatedMap) return;
          var root = getContainer();
          if (!root) return;
          // Bug 1 fix: nascondi TUTTI i paragrafi che contengono "leggi anche" in qualsiasi posizione
          root.querySelectorAll('p').forEach(function(p) {
            if (/leggi\\s+anche/i.test(p.textContent || '')) {
              p.classList.add('legacy-read-also');
            }
          });
          // Trasforma solo i .read-also-box in card (mai i <p>)
          root.querySelectorAll('.read-also-box').forEach(function(box) {
            var slug = box.dataset.slug || null;
            if (!slug) {
              box.querySelectorAll('a[href]').forEach(function(a) {
                if (!slug) slug = getSlugFromHref(a.getAttribute('href'));
              });
            }
            // Bug 4 fix: se slug non risolvibile o non in mappa, nascondi il box senza mostrare broken card
            if (!slug) { box.style.display = 'none'; return; }
            var meta = inContentRelatedMap[slug];
            if (!meta || meta.isItalian === false) { box.style.display = 'none'; return; }
            var card = buildRelatedCard(slug, meta);
            box.innerHTML = '';
            box.classList.add('incontent-related-container');
            box.appendChild(card);
          });
        }
        function runLeggiAnche() {
          removeOldRelatedSections();
          insertReadAlsoBox();
          enhanceReadAlsoBoxes();
        }
        function scheduleLeggiAnche() {
          readAlsoInserted = false;
          runLeggiAnche();
        }
        function run() { scheduleLeggiAnche(); }
        window.addEventListener('load', run);
        document.addEventListener('astro:after-swap', run);
        if (document.readyState === 'complete') run();
        else setTimeout(run, 100);
      })();
    <\/script>  `], ["  ", '<main class="site-main" data-astro-cid-7jjqptxk>  <div class="reading-progress" id="reading-progress" data-astro-cid-7jjqptxk></div> <div class="article-container" data-astro-cid-7jjqptxk>  <nav class="breadcrumbs" data-astro-cid-7jjqptxk> <a', " data-astro-cid-7jjqptxk>", "</a> ", ' </nav>  <header class="article-header-wrapper" data-astro-cid-7jjqptxk>  ', ' <h1 class="article-title" data-astro-cid-7jjqptxk>', "</h1>  ", '  <div class="article-meta" data-astro-cid-7jjqptxk> <div class="article-meta-item" data-astro-cid-7jjqptxk> <img', "", ` class="article-meta-author-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" loading="lazy" data-astro-cid-7jjqptxk> <div class="article-meta-author-placeholder" style="display: none;" data-astro-cid-7jjqptxk> `, " </div> <a", ' class="author-link" data-astro-cid-7jjqptxk>', '</a> </div> <div class="article-meta-item" data-astro-cid-7jjqptxk> ', ' </div> <div class="article-meta-item" data-astro-cid-7jjqptxk> ', " ", " </div> ", ' </div> </header>  <div class="article-hero-wrapper" data-astro-cid-7jjqptxk> <div class="article-hero-image-wrapper" data-astro-cid-7jjqptxk> <img', "", ' class="article-image" loading="eager" decoding="async" fetchpriority="high" data-copertina-fallback', " data-astro-cid-7jjqptxk> ", " </div> </div>  ", " ", '  <div class="social-sticky" id="social-sticky" data-astro-cid-7jjqptxk> <div class="social-sticky-inner" data-astro-cid-7jjqptxk> <a', ' target="_blank" rel="noopener noreferrer" class="social-link facebook" aria-label="Condividi su Facebook" data-astro-cid-7jjqptxk> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" data-astro-cid-7jjqptxk> <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" data-astro-cid-7jjqptxk></path> </svg> </a> <a', ' target="_blank" rel="noopener noreferrer" class="social-link twitter" aria-label="Condividi su X (Twitter)" data-astro-cid-7jjqptxk> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" data-astro-cid-7jjqptxk> <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" data-astro-cid-7jjqptxk></path> </svg> </a> <a', ' target="_blank" rel="noopener noreferrer" class="social-link whatsapp" aria-label="Condividi su WhatsApp" data-astro-cid-7jjqptxk> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" data-astro-cid-7jjqptxk> <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" data-astro-cid-7jjqptxk></path> </svg> </a> <a', ' target="_blank" rel="noopener noreferrer" class="social-link linkedin" aria-label="Condividi su LinkedIn" data-astro-cid-7jjqptxk> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" data-astro-cid-7jjqptxk> <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" data-astro-cid-7jjqptxk></path> </svg> </a> <a', ' class="social-link email" aria-label="Invia via email" data-astro-cid-7jjqptxk> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" data-astro-cid-7jjqptxk> <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" data-astro-cid-7jjqptxk></path> </svg> </a> <a href="#" class="social-link copy-link" aria-label="Copia link"', ' data-astro-cid-7jjqptxk> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" data-astro-cid-7jjqptxk> <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" data-astro-cid-7jjqptxk></path> </svg> </a> </div> </div>  <div class="article-content-wrapper" data-astro-cid-7jjqptxk> <div class="article-content" id="article-content" data-astro-cid-7jjqptxk> ', " <div data-astro-cid-7jjqptxk>", "</div> ", " ", ' </div>  <div class="author-bio-section" data-astro-cid-7jjqptxk> <div class="author-bio-wrapper" data-astro-cid-7jjqptxk> <div class="author-bio-avatar" data-astro-cid-7jjqptxk> <img', "", ` class="author-bio-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" loading="lazy" data-astro-cid-7jjqptxk> <div class="author-bio-placeholder" style="display: none;" data-astro-cid-7jjqptxk> `, ' </div> </div> <div class="author-bio-content" data-astro-cid-7jjqptxk> <h3 class="author-bio-name" data-astro-cid-7jjqptxk> <a', ' class="author-bio-link" data-astro-cid-7jjqptxk> ', ' </a> </h3> <div class="author-bio-text" data-astro-cid-7jjqptxk> ', ' </div> <p class="author-bio-total" data-astro-cid-7jjqptxk> ', ' <a href="/autori" data-astro-cid-7jjqptxk>', " ", "</a> </p> </div> </div> </div> ", ' </div>  <div class="floating-widget" id="floating-widget" data-astro-cid-7jjqptxk> <button class="close-btn" id="close-widget"', " data-astro-cid-7jjqptxk>\xD7</button> <h4 data-astro-cid-7jjqptxk>", "</h4> ", " ", " <a", ' class="widget-link" data-astro-cid-7jjqptxk>', "</a> </div>  ", " ", '  <details class="debug-section" hidden data-astro-cid-7jjqptxk> <summary style="cursor: pointer; color: var(--text-secondary); font-size: 0.85rem; margin-top: 2rem; padding: 0.5rem;" data-astro-cid-7jjqptxk>\n\u{1F50D} Debug: Dati articolo\n</summary> <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.75rem; margin-top: 0.5rem;" data-astro-cid-7jjqptxk>', '\n        </pre> <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.75rem; margin-top: 0.5rem;" data-astro-cid-7jjqptxk>ID: ', "\nSlug: ", '\n        </pre> </details> <section class="article-nav-section" aria-label="Navigazione" data-astro-cid-7jjqptxk> <a', ' class="back-link" data-astro-cid-7jjqptxk>\u2190 ', "</a> </section> </div> </main> ", "<script>(function(){", `
      window.__BLOG_PAGE_DATA__ = { wpIdToSlugMap, inContentRelatedMap, currentSlug, readAlsoLabel, alternateArticleUrl, currentWpIdClean };
    })();<\/script> <script>
      (function() {
        var data = window.__BLOG_PAGE_DATA__;
        if (!data) return;
        var wpIdToSlugMap = data.wpIdToSlugMap || {};
        var inContentRelatedMap = data.inContentRelatedMap || {};
        var currentSlug = data.currentSlug;
        var readAlsoLabel = data.readAlsoLabel || 'Leggi anche';
        function getContainer() {
          return document.querySelector('article') || document.querySelector('.prose') || document.body;
        }
        function getParagraphs(container) {
          if (!container) return [];
          return Array.from(container.children || []);
        }
        var readAlsoInserted = false;
        function getSlugFromHref(href) {
          if (!href) return null;
          var wpMatch = href.match(/[?&]p=(\\\\d+)/);
          if (wpMatch && wpIdToSlugMap) {
            var wpId = parseInt(wpMatch[1], 10);
            return wpIdToSlugMap[wpId] || null;
          }
          try {
            var url = new URL(href, window.location.origin);
            var segments = url.pathname.split('/').filter(Boolean);
            var blogIndex = segments.indexOf('blog');
            if (blogIndex !== -1 && segments.length > blogIndex + 1) return segments.slice(blogIndex + 1).join('/');
            if (segments.length > 0) return segments[segments.length - 1];
          } catch (e) {}
          return null;
        }
        function buildRelatedCard(slug, meta) {
          var hrefFinal = meta.href || '/blog/' + slug;
          var safeTitle = (meta.title || '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
          var safeExcerpt = (meta.excerpt || '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
          var article = document.createElement('article');
          article.className = 'incontent-related-card';
          article.innerHTML = '<a href="' + hrefFinal + '" class="incontent-related-link"><span class="incontent-related-label">' + readAlsoLabel + '</span><div class="incontent-related-image-wrapper"><img src="' + meta.image + '" alt="' + safeTitle + '" loading="lazy" onerror="this.onerror=null;this.src=\\\\'/images/placeholder-copertina.svg\\\\'" /></div><div class="incontent-related-content"><h4 class="incontent-related-title">' + safeTitle + '</h4>' + (safeExcerpt ? '<p class="incontent-related-excerpt">' + safeExcerpt + '</p>' : '') + '</div></a>';
          return article;
        }
        function removeOldRelatedSections() {
          var root = getContainer();
          if (!root) return;
          var oldSectionTitles = ['Articoli', 'Editoriale', 'Rubriche', 'Libri'];
          var children = Array.from(root.children);
          var lastThree = children.slice(-3);
          root.querySelectorAll('h4').forEach(function(h4) {
            // Bug 2 fix: rimuovi solo se l'h4 \xE8 tra gli ultimi 3 figli diretti del container
            var isNearEnd = lastThree.includes(h4) || lastThree.some(function(el) { return el.contains(h4); });
            if (!isNearEnd) return;
            var text = (h4.textContent || '').trim();
            if (oldSectionTitles.some(function(t) { return text === t || text.indexOf(t) !== -1 || text.endsWith(t); })) {
              var next = h4.nextElementSibling;
              while (next) {
                var toRemove = next;
                next = next.nextElementSibling;
                toRemove.remove();
              }
              h4.remove();
            }
          });
        }
        function insertReadAlsoBox() {
          if (readAlsoInserted || !inContentRelatedMap) return;
          if (document.querySelector('.incontent-related-card')) return;
          var container = getContainer();
          if (!container) return;
          var currentMeta = currentSlug ? inContentRelatedMap[currentSlug] : null;
          var currentCategory = currentMeta && currentMeta.category ? currentMeta.category : null;
          var allEntries = Object.entries(inContentRelatedMap);
          var candidates = allEntries.filter(function(entry) {
            var slug = entry[0], meta = entry[1];
            if (slug === currentSlug) return false;
            if (!meta || meta.isItalian === false) return false;
            if (currentCategory && meta.category) return meta.category === currentCategory;
            return true;
          });
          if (currentCategory && candidates.length === 0) {
            candidates = allEntries.filter(function(entry) {
              if (entry[0] === currentSlug) return false;
              return !!entry[1] && entry[1].isItalian !== false;
            });
          }
          if (!candidates.length) return;
          var randomIndex = Math.floor(Math.random() * candidates.length);
          var chosenSlug = candidates[randomIndex][0];
          var box = document.createElement('div');
          box.className = 'read-also-box';
          box.dataset.slug = chosenSlug;
          // Bug 3 fix: inserisci dopo il 3\xB0 paragrafo <p> diretto, non il 2\xB0 figlio generico
          var paragraphs = Array.from(container.querySelectorAll(':scope > p'));
          if (!paragraphs.length) return;
          var insertAfter = paragraphs[2] || paragraphs[paragraphs.length - 1];
          insertAfter.insertAdjacentElement('afterend', box);
          readAlsoInserted = true;
        }
        function enhanceReadAlsoBoxes() {
          if (!inContentRelatedMap) return;
          var root = getContainer();
          if (!root) return;
          // Bug 1 fix: nascondi TUTTI i paragrafi che contengono "leggi anche" in qualsiasi posizione
          root.querySelectorAll('p').forEach(function(p) {
            if (/leggi\\\\s+anche/i.test(p.textContent || '')) {
              p.classList.add('legacy-read-also');
            }
          });
          // Trasforma solo i .read-also-box in card (mai i <p>)
          root.querySelectorAll('.read-also-box').forEach(function(box) {
            var slug = box.dataset.slug || null;
            if (!slug) {
              box.querySelectorAll('a[href]').forEach(function(a) {
                if (!slug) slug = getSlugFromHref(a.getAttribute('href'));
              });
            }
            // Bug 4 fix: se slug non risolvibile o non in mappa, nascondi il box senza mostrare broken card
            if (!slug) { box.style.display = 'none'; return; }
            var meta = inContentRelatedMap[slug];
            if (!meta || meta.isItalian === false) { box.style.display = 'none'; return; }
            var card = buildRelatedCard(slug, meta);
            box.innerHTML = '';
            box.classList.add('incontent-related-container');
            box.appendChild(card);
          });
        }
        function runLeggiAnche() {
          removeOldRelatedSections();
          insertReadAlsoBox();
          enhanceReadAlsoBoxes();
        }
        function scheduleLeggiAnche() {
          readAlsoInserted = false;
          runLeggiAnche();
        }
        function run() { scheduleLeggiAnche(); }
        window.addEventListener('load', run);
        document.addEventListener('astro:after-swap', run);
        if (document.readyState === 'complete') run();
        else setTimeout(run, 100);
      })();
    <\/script>  `])), maybeRenderHead(), addAttribute(locale === "en" ? "/blog/en" : "/archivio", "href"), t(locale, "nav_archive"), issueNumber && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-7jjqptxk": true }, { "default": async ($$result3) => renderTemplate`${" > "}<a${addAttribute(issueLink, "href")} data-astro-cid-7jjqptxk>Numero ${issueNumber}</a> ` })}`, !showPubblicatoOnline ? renderTemplate`<nav class="article-category-badge" aria-label="Categoria e numero" data-astro-cid-7jjqptxk> ${issueLink && renderTemplate`<a${addAttribute(issueLink, "href")} class="article-badge-link" data-astro-cid-7jjqptxk>Numero ${issueNumber}</a>`} ${issueLink && (formaDisplay || categoryLink) && renderTemplate`<span class="article-badge-sep" data-astro-cid-7jjqptxk> • </span>`} ${formaDisplay && renderTemplate`<span class="article-badge-text" data-astro-cid-7jjqptxk>${formaDisplay}</span>`} ${formaDisplay && categoryLink && renderTemplate`<span class="article-badge-sep" data-astro-cid-7jjqptxk> / </span>`} ${categoryLink ? renderTemplate`<a${addAttribute(categoryLink, "href")} class="article-badge-link" data-astro-cid-7jjqptxk>${categoryDisplay}</a>` : renderTemplate`<span class="article-badge-text" data-astro-cid-7jjqptxk>${categoryDisplay}</span>`} </nav>` : renderTemplate`<div class="article-category-badge article-category-badge--online" data-astro-cid-7jjqptxk> ${categoryLink ? renderTemplate`<a${addAttribute(categoryLink, "href")} class="article-badge-link" data-astro-cid-7jjqptxk>${categoryDisplay}</a>` : t(locale, "published_online")} </div>`, articleTitle, explicitSubtitle && renderTemplate`<div class="article-subtitle" data-astro-cid-7jjqptxk> ${explicitSubtitle} </div>`, addAttribute(authorImagePath, "src"), addAttribute(autoreName, "alt"), autoreName.charAt(0).toUpperCase(), addAttribute(`/autori/${authorSlug}`, "href"), autoreName, formatDateItalian(articleDate), readingTime, t(locale, "min_read"), roleLabel && renderTemplate`<div class="article-meta-item" data-astro-cid-7jjqptxk> <span${addAttribute(`article-badge-role${roleClassName}`, "class")} data-astro-cid-7jjqptxk>${roleLabel}</span> </div>`, addAttribute(articleImage, "src"), addAttribute(articleTitle, "alt"), addAttribute(COPERTINA_IMG_ONERROR, "onerror"), heroCaption && renderTemplate`<div class="article-image-caption" data-astro-cid-7jjqptxk> <img src="https://www.ombreeluci.it/wp-content/uploads/2023/10/icon-camera.png" alt="" class="caption-camera-icon" aria-hidden="true" data-astro-cid-7jjqptxk> ${heroCaption} </div>`, articleDate.getFullYear() < 2e3 && renderTemplate`<div class="article-header-wrapper" data-astro-cid-7jjqptxk> <div class="archival-alert" data-astro-cid-7jjqptxk> <strong data-astro-cid-7jjqptxk>Contenuto d'archivio:</strong> Questo articolo del ${articleDate.getFullYear()} riflette il linguaggio e le sensibilità del suo tempo.
</div> </div>`, isTranslation && articleDate.getFullYear() < 2e3 && renderTemplate`<div class="article-header-wrapper" data-astro-cid-7jjqptxk> <div class="archival-alert-en" data-astro-cid-7jjqptxk> <strong data-astro-cid-7jjqptxk>This archival content from ${articleDate.getFullYear()} reflects the language and sensitivities of its time.</strong> </div> </div>`, addAttribute(`https://www.facebook.com/sharer/sharer.php?u=${Astro2.url.href}`, "href"), addAttribute(`https://twitter.com/intent/tweet?url=${Astro2.url.href}&text=${encodeURIComponent(articleTitle)}`, "href"), addAttribute(`https://wa.me/?text=${encodeURIComponent(articleTitle + " " + Astro2.url.href)}`, "href"), addAttribute(`https://www.linkedin.com/sharing/share-offsite/?url=${Astro2.url.href}`, "href"), addAttribute(`mailto:?subject=${encodeURIComponent(articleTitle)}&body=${encodeURIComponent(Astro2.url.href)}`, "href"), addAttribute(`event.preventDefault(); navigator.clipboard.writeText('${Astro2.url.href}'); this.setAttribute('aria-label', 'Link copiato!'); setTimeout(() => this.setAttribute('aria-label', 'Copia link'), 2000); return false;`, "onclick"), isJeanVanier && renderTemplate`<aside class="vanier-alert" role="note" data-astro-cid-7jjqptxk> <div data-astro-cid-7jjqptxk>Avviso: inchieste promosse dall'Arca internazionale hanno accertato gravi responsabilità di padre Thomas Philippe (la prima nel 2015) e di Jean Vanier (2020) nei confronti di diverse donne. <a href="https://www.ombreeluci.it/2020/larca-internazionale-annuncia-i-risultati-dellindagine-indipendente/" data-astro-cid-7jjqptxk>Qui il comunicato più recente</a> che condanna senza riserve queste azioni «in totale contraddizione con i valori che Vanier sosteneva» e con «i principi fondamentali delle nostre comunità».</div> </aside>`, unescapeHTML(corpoPart1), leggiAncheArticolo && renderTemplate`${renderComponent($$result2, "LeggiAnche", $$LeggiAnche, { "articolo": leggiAncheArticolo, "data-astro-cid-7jjqptxk": true })}`, corpoPart2 && renderTemplate`<div data-astro-cid-7jjqptxk>${unescapeHTML(corpoPart2)}</div>`, addAttribute(authorImagePath, "src"), addAttribute(autoreName, "alt"), autoreName.charAt(0).toUpperCase(), addAttribute(`/autori/${authorSlug}`, "href"), autoreName, authorBio ? renderTemplate`<div data-astro-cid-7jjqptxk>${unescapeHTML(authorBio)}</div>` : t(locale, "author_bio_fallback"), t(locale, "author_total_prefix"), totalAutori, t(locale, "author_total"), renderComponent($$result2, "EditorialFeedback", $$EditorialFeedback, { "wpId": articolo.wp_id, "title": articleTitle, "currentRole": ruolo_editoriale, "url": Astro2.url.href, "articoloId": articolo.id, "data-astro-cid-7jjqptxk": true }), addAttribute(t(locale, "widget_close"), "aria-label"), t(locale, "widget_navigate"), pdfUrl ? renderTemplate`<a${addAttribute(pdfUrl, "href")} target="_blank" rel="noopener noreferrer" class="widget-link" data-astro-cid-7jjqptxk>${t(locale, "widget_download_pdf")}</a>` : null, issueLink ? renderTemplate`<a${addAttribute(issueLink, "href")} class="widget-link" data-astro-cid-7jjqptxk>${t(locale, "widget_go_to_issue")}</a>` : null, addAttribute(locale === "en" ? "/blog/en" : "/archivio", "href"), t(locale, "nav_archive"), relatedArticles.length > 0 && renderTemplate`<section class="related-footer-section"${addAttribute(locale === "en" ? "Related articles" : "Articoli correlati", "aria-label")} data-astro-cid-7jjqptxk> <div class="related-footer-inner" data-astro-cid-7jjqptxk> <h2 class="related-footer-title" data-astro-cid-7jjqptxk> ${locale === "en" ? "Related articles" : "Articoli correlati"} </h2> <div class="related-footer-grid" data-astro-cid-7jjqptxk> ${relatedArticles.map((rel) => renderTemplate`${renderComponent($$result2, "ArticleCard", $$ArticleCard, { "title": rel.title, "author": rel.author, "date": rel.date, "issue": rel.issue, "slug": rel.slug, "image": rel.image, "categoriaMenu": rel.categoriaMenu, "forma": rel.forma, "ruoloEditoriale": rel.ruoloEditoriale, "data-astro-cid-7jjqptxk": true })}`)} </div> </div> </section>`, articolo.has_comments && renderTemplate`<div class="comments-section" data-astro-cid-7jjqptxk>
-- Qui appariranno i commenti di Trikkia --
</div>`, JSON.stringify({ id: articolo.id, wp_id: articolo.wp_id, slug: articolo.slug, titolo: articolo.titolo, lang: articolo.lang, stato: articolo.stato, data_pubblicazione: articolo.data_pubblicazione }, null, 2), articolo.id, articolo.slug, addAttribute(locale === "en" ? "/blog/en" : "/", "href"), t(locale, "back_to_home"), hasInstagram && renderTemplate(_a || (_a = __template(['<script async src="https://www.instagram.com/embed.js"><\/script>']))), defineScriptVars({ wpIdToSlugMap, inContentRelatedMap, currentSlug, readAlsoLabel: t(locale, "read_also"), alternateArticleUrl, currentWpIdClean })), "head": async ($$result2) => renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "slot": "head" }, { "default": async ($$result3) => renderTemplate` <meta name="pagefind:meta"${addAttribute(`author:${autoreName}`, "content")}> ` })}` })} `;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/blog/[...slug].astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/blog/[...slug].astro";
const $$url = "/blog/[...slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
