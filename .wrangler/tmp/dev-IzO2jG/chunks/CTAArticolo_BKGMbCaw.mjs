globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createAstro, a as createComponent, b as renderComponent, r as renderTemplate, g as renderSlot, m as maybeRenderHead, e as addAttribute, d as defineScriptVars } from './astro/server_BT9XwReg.mjs';
import { $ as $$BaseLayout } from './BaseLayout_DOaiilqT.mjs';
/* empty css                          */
import { t } from './Footer_DN9MDnF9.mjs';
import { i as directusCredsFromAstroLocals, t as getCommentiForArticolo } from './directus_BvF_bImd.mjs';
import { c as ctaData } from './cta_BwIVYshf.mjs';

const $$Astro$3 = createAstro("https://ombreeluci.it");
const $$ArticlePageLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$ArticlePageLayout;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { ...Astro2.props }, { "default": ($$result2) => renderTemplate`  ${renderSlot($$result2, $$slots["default"])} `, "head": ($$result2) => renderTemplate`${renderSlot($$result2, $$slots["head"])}` })} `;
}, "C:/Users/berto/Documents/Ombreeluci/src/layouts/ArticlePageLayout.astro", void 0);

const $$Astro$2 = createAstro("https://ombreeluci.it");
const $$EditorialFeedback = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$EditorialFeedback;
  const { wpId, title, currentRole, url, articoloId, lang: langProp } = Astro2.props;
  const lang = langProp ?? "it";
  const directusEditUrl = articoloId ? `https://cms.ombreeluci.it/admin/content/articoli/${articoloId}` : "https://cms.ombreeluci.it/admin/content/articoli";
  return renderTemplate`<!-- Bottone modifica Directus (sempre nel DOM, mostrato via JS) -->${maybeRenderHead()}<a id="directus-edit-btn"${addAttribute(directusEditUrl, "href")} target="_blank" rel="noopener noreferrer" class="directus-edit-btn" hidden data-astro-cid-7umwo7jf>
✏ ${t(lang, "editorial_directus_edit")} </a> <aside class="editorial-feedback"${addAttribute(t(lang, "editorial_aria"), "aria-label")} id="editorial-feedback-box" hidden data-astro-cid-7umwo7jf> <div class="editorial-feedback-header" data-astro-cid-7umwo7jf> <span class="editorial-feedback-title" data-astro-cid-7umwo7jf>${t(lang, "editorial_box_title")}</span> </div> <form id="editorial-feedback-form" class="editorial-feedback-form"${addAttribute(t(lang, "editorial_sending"), "data-msg-sending")}${addAttribute(t(lang, "editorial_sent"), "data-msg-sent")}${addAttribute(t(lang, "editorial_network_error"), "data-msg-error")} data-astro-cid-7umwo7jf> <div class="editorial-feedback-row" data-astro-cid-7umwo7jf> <label for="proposed_role" class="editorial-feedback-label" data-astro-cid-7umwo7jf>${t(lang, "editorial_proposed_role")}</label> <select id="proposed_role" name="proposed_role" class="editorial-feedback-select" data-astro-cid-7umwo7jf> <option value="" data-astro-cid-7umwo7jf>${t(lang, "editorial_role_none")}</option> <option value="portante" data-astro-cid-7umwo7jf>${t(lang, "editorial_role_portante")}</option> <option value="strutturale" data-astro-cid-7umwo7jf>${t(lang, "editorial_role_strutturale")}</option> <option value="laterale" data-astro-cid-7umwo7jf>${t(lang, "editorial_role_laterale")}</option> <option value="trasversale" data-astro-cid-7umwo7jf>${t(lang, "editorial_role_trasversale")}</option> </select> </div> <div class="editorial-feedback-row" data-astro-cid-7umwo7jf> <label for="notes" class="editorial-feedback-label" data-astro-cid-7umwo7jf>${t(lang, "editorial_notes")}</label> <textarea id="notes" name="notes" class="editorial-feedback-textarea"${addAttribute(3, "rows")} data-astro-cid-7umwo7jf></textarea> </div> <input type="hidden" name="wp_id"${addAttribute(wpId ?? "", "value")} data-astro-cid-7umwo7jf> <input type="hidden" name="title"${addAttribute(title, "value")} data-astro-cid-7umwo7jf> <input type="hidden" name="current_role"${addAttribute(currentRole ?? "", "value")} data-astro-cid-7umwo7jf> <input type="hidden" name="url"${addAttribute(url, "value")} data-astro-cid-7umwo7jf> <div class="editorial-feedback-row editorial-feedback-actions" data-astro-cid-7umwo7jf> <button type="submit" class="editorial-feedback-submit" data-astro-cid-7umwo7jf>${t(lang, "editorial_submit")}</button> <p id="feedback-status" class="editorial-feedback-status" hidden data-astro-cid-7umwo7jf></p> </div> </form> </aside>  `;
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

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro$1 = createAstro("https://ombreeluci.it");
const $$Commenti = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Commenti;
  const { articoloId, lang = "it" } = Astro2.props;
  const creds = directusCredsFromAstroLocals(Astro2.locals);
  const commenti = await getCommentiForArticolo(articoloId, creds);
  function formatData(iso) {
    return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "it-IT", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(new Date(iso));
  }
  const ui = lang === "en" ? {
    showComments: commenti.length === 1 ? "1 comment" : `${commenti.length} comments`,
    formTitle: "Leave a comment",
    formNote: "Your comment will be published after editorial approval. Your email will not be published.",
    labelName: "Name",
    labelComment: "Comment",
    submitBtn: "Submit comment"
  } : {
    showComments: commenti.length === 1 ? "1 commento" : `${commenti.length} commenti`,
    formTitle: "Lascia un commento",
    formNote: "Il tuo commento sar\xE0 pubblicato dopo approvazione della redazione. L'email non verr\xE0 pubblicata.",
    labelName: "Nome",
    labelComment: "Commento",
    submitBtn: "Invia commento"
  };
  return renderTemplate(_a || (_a = __template(["", '<section class="commenti-section" data-astro-cid-n2y5q5hq> ', ' <details class="commenti-accordion" data-astro-cid-n2y5q5hq> <summary class="commenti-accordion-summary" data-astro-cid-n2y5q5hq> <span class="commenti-accordion-label" data-astro-cid-n2y5q5hq>', '</span> <span class="commenti-accordion-icon" aria-hidden="true" data-astro-cid-n2y5q5hq></span> </summary> <div class="commento-form-wrap" data-astro-cid-n2y5q5hq> <p class="commento-form-nota" data-astro-cid-n2y5q5hq>', '</p> <form class="commento-form"', ' novalidate data-astro-cid-n2y5q5hq>  <input type="text" name="hp" autocomplete="off" aria-hidden="true" tabindex="-1" style="position:absolute;left:-9999px;opacity:0;pointer-events:none;" data-astro-cid-n2y5q5hq> <div class="commento-form-row commento-form-row--half" data-astro-cid-n2y5q5hq> <label class="commento-label" for="commento-nome" data-astro-cid-n2y5q5hq> ', ' <span aria-hidden="true" data-astro-cid-n2y5q5hq>*</span> </label> <input class="commento-input" type="text" id="commento-nome" name="autore_nome" autocomplete="name" required maxlength="100" data-astro-cid-n2y5q5hq> </div> <div class="commento-form-row commento-form-row--half" data-astro-cid-n2y5q5hq> <label class="commento-label" for="commento-email" data-astro-cid-n2y5q5hq>\nEmail <span aria-hidden="true" data-astro-cid-n2y5q5hq>*</span> </label> <input class="commento-input" type="email" id="commento-email" name="autore_email" autocomplete="email" required maxlength="200" data-astro-cid-n2y5q5hq> </div> <div class="commento-form-row" data-astro-cid-n2y5q5hq> <label class="commento-label" for="commento-testo" data-astro-cid-n2y5q5hq> ', ' <span aria-hidden="true" data-astro-cid-n2y5q5hq>*</span> </label> <textarea class="commento-input commento-textarea" id="commento-testo" name="testo" required minlength="10" maxlength="5000" rows="5" data-astro-cid-n2y5q5hq></textarea> </div> <div class="commento-form-row commento-form-actions" data-astro-cid-n2y5q5hq> <button type="submit" class="button commento-submit" data-astro-cid-n2y5q5hq> ', ' </button> <span class="commento-contatore" aria-live="polite" data-astro-cid-n2y5q5hq></span> </div> <div class="commento-feedback" role="alert" aria-live="assertive" hidden data-astro-cid-n2y5q5hq></div> </form> </div> </details> </section> <script>(function(){', "\n  const _isEn = commentoLang === 'en';\n  const _str = {\n    submitting: _isEn ? 'Submitting\u2026' : 'Invio in corso\u2026',\n    charsLeft: (n: number) => _isEn ? `${n} characters remaining` : `${n} caratteri rimanenti`,\n    success: _isEn\n      ? 'Thank you! Your comment has been submitted and will be published after editorial approval.'\n      : 'Grazie! Il tuo commento \xE8 stato inviato e sar\xE0 pubblicato dopo approvazione della redazione.',\n    errGeneric: _isEn ? 'An error occurred. Please try again.' : 'Si \xE8 verificato un errore. Riprova.',\n    errNetwork: _isEn\n      ? 'Could not send the comment. Please check your connection and try again.'\n      : 'Impossibile inviare il commento. Controlla la connessione e riprova.',\n  };\n\n  document.querySelectorAll<HTMLFormElement>('.commento-form').forEach((form) => {\n    const articoloId = form.dataset.articoloId ?? '';\n    const feedback = form.querySelector<HTMLElement>('.commento-feedback')!;\n    const submitBtn = form.querySelector<HTMLButtonElement>('.commento-submit')!;\n    const textarea = form.querySelector<HTMLTextAreaElement>('#commento-testo')!;\n    const contatore = form.querySelector<HTMLElement>('.commento-contatore')!;\n\n    // Contatore caratteri textarea\n    textarea?.addEventListener('input', () => {\n      const left = 5000 - textarea.value.length;\n      contatore.textContent = left < 500 ? _str.charsLeft(left) : '';\n    });\n\n    form.addEventListener('submit', async (e) => {\n      e.preventDefault();\n      feedback.hidden = true;\n      submitBtn.disabled = true;\n      submitBtn.textContent = _str.submitting;\n\n      const data = Object.fromEntries(new FormData(form));\n\n      try {\n        const res = await fetch('/api/commento', {\n          method: 'POST',\n          headers: { 'Content-Type': 'application/json' },\n          body: JSON.stringify({ ...data, articolo_id: articoloId }),\n        });\n        const body = await res.json() as { ok: boolean; error?: string };\n\n        if (body.ok) {\n          form.reset();\n          showFeedback('success', _str.success);\n          contatore.textContent = '';\n        } else {\n          showFeedback('error', body.error ?? _str.errGeneric);\n        }\n      } catch {\n        showFeedback('error', _str.errNetwork);\n      } finally {\n        submitBtn.disabled = false;\n        submitBtn.textContent = commentoSubmitBtn;\n      }\n    });\n\n    function showFeedback(type: 'success' | 'error', msg: string) {\n      feedback.textContent = msg;\n      feedback.className = `commento-feedback commento-feedback--${type}`;\n      feedback.hidden = false;\n      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });\n    }\n  });\n})();<\/script> "], ["", '<section class="commenti-section" data-astro-cid-n2y5q5hq> ', ' <details class="commenti-accordion" data-astro-cid-n2y5q5hq> <summary class="commenti-accordion-summary" data-astro-cid-n2y5q5hq> <span class="commenti-accordion-label" data-astro-cid-n2y5q5hq>', '</span> <span class="commenti-accordion-icon" aria-hidden="true" data-astro-cid-n2y5q5hq></span> </summary> <div class="commento-form-wrap" data-astro-cid-n2y5q5hq> <p class="commento-form-nota" data-astro-cid-n2y5q5hq>', '</p> <form class="commento-form"', ' novalidate data-astro-cid-n2y5q5hq>  <input type="text" name="hp" autocomplete="off" aria-hidden="true" tabindex="-1" style="position:absolute;left:-9999px;opacity:0;pointer-events:none;" data-astro-cid-n2y5q5hq> <div class="commento-form-row commento-form-row--half" data-astro-cid-n2y5q5hq> <label class="commento-label" for="commento-nome" data-astro-cid-n2y5q5hq> ', ' <span aria-hidden="true" data-astro-cid-n2y5q5hq>*</span> </label> <input class="commento-input" type="text" id="commento-nome" name="autore_nome" autocomplete="name" required maxlength="100" data-astro-cid-n2y5q5hq> </div> <div class="commento-form-row commento-form-row--half" data-astro-cid-n2y5q5hq> <label class="commento-label" for="commento-email" data-astro-cid-n2y5q5hq>\nEmail <span aria-hidden="true" data-astro-cid-n2y5q5hq>*</span> </label> <input class="commento-input" type="email" id="commento-email" name="autore_email" autocomplete="email" required maxlength="200" data-astro-cid-n2y5q5hq> </div> <div class="commento-form-row" data-astro-cid-n2y5q5hq> <label class="commento-label" for="commento-testo" data-astro-cid-n2y5q5hq> ', ' <span aria-hidden="true" data-astro-cid-n2y5q5hq>*</span> </label> <textarea class="commento-input commento-textarea" id="commento-testo" name="testo" required minlength="10" maxlength="5000" rows="5" data-astro-cid-n2y5q5hq></textarea> </div> <div class="commento-form-row commento-form-actions" data-astro-cid-n2y5q5hq> <button type="submit" class="button commento-submit" data-astro-cid-n2y5q5hq> ', ' </button> <span class="commento-contatore" aria-live="polite" data-astro-cid-n2y5q5hq></span> </div> <div class="commento-feedback" role="alert" aria-live="assertive" hidden data-astro-cid-n2y5q5hq></div> </form> </div> </details> </section> <script>(function(){', "\n  const _isEn = commentoLang === 'en';\n  const _str = {\n    submitting: _isEn ? 'Submitting\u2026' : 'Invio in corso\u2026',\n    charsLeft: (n: number) => _isEn ? \\`\\${n} characters remaining\\` : \\`\\${n} caratteri rimanenti\\`,\n    success: _isEn\n      ? 'Thank you! Your comment has been submitted and will be published after editorial approval.'\n      : 'Grazie! Il tuo commento \xE8 stato inviato e sar\xE0 pubblicato dopo approvazione della redazione.',\n    errGeneric: _isEn ? 'An error occurred. Please try again.' : 'Si \xE8 verificato un errore. Riprova.',\n    errNetwork: _isEn\n      ? 'Could not send the comment. Please check your connection and try again.'\n      : 'Impossibile inviare il commento. Controlla la connessione e riprova.',\n  };\n\n  document.querySelectorAll<HTMLFormElement>('.commento-form').forEach((form) => {\n    const articoloId = form.dataset.articoloId ?? '';\n    const feedback = form.querySelector<HTMLElement>('.commento-feedback')!;\n    const submitBtn = form.querySelector<HTMLButtonElement>('.commento-submit')!;\n    const textarea = form.querySelector<HTMLTextAreaElement>('#commento-testo')!;\n    const contatore = form.querySelector<HTMLElement>('.commento-contatore')!;\n\n    // Contatore caratteri textarea\n    textarea?.addEventListener('input', () => {\n      const left = 5000 - textarea.value.length;\n      contatore.textContent = left < 500 ? _str.charsLeft(left) : '';\n    });\n\n    form.addEventListener('submit', async (e) => {\n      e.preventDefault();\n      feedback.hidden = true;\n      submitBtn.disabled = true;\n      submitBtn.textContent = _str.submitting;\n\n      const data = Object.fromEntries(new FormData(form));\n\n      try {\n        const res = await fetch('/api/commento', {\n          method: 'POST',\n          headers: { 'Content-Type': 'application/json' },\n          body: JSON.stringify({ ...data, articolo_id: articoloId }),\n        });\n        const body = await res.json() as { ok: boolean; error?: string };\n\n        if (body.ok) {\n          form.reset();\n          showFeedback('success', _str.success);\n          contatore.textContent = '';\n        } else {\n          showFeedback('error', body.error ?? _str.errGeneric);\n        }\n      } catch {\n        showFeedback('error', _str.errNetwork);\n      } finally {\n        submitBtn.disabled = false;\n        submitBtn.textContent = commentoSubmitBtn;\n      }\n    });\n\n    function showFeedback(type: 'success' | 'error', msg: string) {\n      feedback.textContent = msg;\n      feedback.className = \\`commento-feedback commento-feedback--\\${type}\\`;\n      feedback.hidden = false;\n      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });\n    }\n  });\n})();<\/script> "])), maybeRenderHead(), commenti.length > 0 && renderTemplate`<details class="commenti-accordion" data-astro-cid-n2y5q5hq> <summary class="commenti-accordion-summary" data-astro-cid-n2y5q5hq> <span class="commenti-accordion-label" data-astro-cid-n2y5q5hq>${ui.showComments}</span> <span class="commenti-accordion-icon" aria-hidden="true" data-astro-cid-n2y5q5hq></span> </summary> <ol class="commenti-lista" aria-label="Commenti approvati" data-astro-cid-n2y5q5hq> ${commenti.map((c) => renderTemplate`<li class="commento" data-astro-cid-n2y5q5hq> <div class="commento-header" data-astro-cid-n2y5q5hq> <span class="commento-autore" data-astro-cid-n2y5q5hq>${c.autore_nome}</span> <time class="commento-data"${addAttribute(c.data_creazione, "datetime")} data-astro-cid-n2y5q5hq> ${formatData(c.data_creazione)} </time> </div> <p class="commento-testo" data-astro-cid-n2y5q5hq>${c.testo}</p> </li>`)} </ol> </details>`, ui.formTitle, ui.formNote, addAttribute(articoloId, "data-articolo-id"), ui.labelName, ui.labelComment, ui.submitBtn, defineScriptVars({ commentoLang: lang, commentoSubmitBtn: ui.submitBtn }));
}, "C:/Users/berto/Documents/Ombreeluci/src/components/Commenti.astro", void 0);

const $$Astro = createAstro("https://ombreeluci.it");
const $$CTAArticolo = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$CTAArticolo;
  const { lang = "it", pageContext = "articolo" } = Astro2.props;
  const ctas = ctaData.articolo;
  const cta = ctas[Math.floor(Math.random() * ctas.length)];
  const ui = lang === "en" ? cta.en : cta.it;
  const utmLink = `/sostienici?utm_source=${pageContext}&utm_medium=cta-inline&utm_campaign=${cta.id}&utm_content=${lang}`;
  return renderTemplate`${maybeRenderHead()}<aside${addAttribute(`cta-articolo cta-articolo--${cta.colore}`, "class")}${addAttribute(cta.id, "data-cta-id")}${addAttribute(cta.name, "data-cta-name")}${addAttribute(lang === "en" ? "Support us" : "Sostienici", "aria-label")} data-astro-cid-aeru4wkm> <p class="cta-articolo__titolo" data-astro-cid-aeru4wkm>${ui.titolo}</p> <p class="cta-articolo__testo" data-astro-cid-aeru4wkm>${ui.testo}</p> <a${addAttribute(utmLink, "href")} class="cta-articolo__link"${addAttribute(cta.id, "data-cta-id")}${addAttribute(pageContext, "data-cta-context")} data-astro-cid-aeru4wkm>${ui.cta} →</a> </aside> `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/CTAArticolo.astro", void 0);

export { $$ArticlePageLayout as $, $$Commenti as a, $$EditorialFeedback as b, autoriStats as c, $$CTAArticolo as d };
