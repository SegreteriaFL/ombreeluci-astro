const UTM = 'utm_source=ombreeluci&utm_medium=referral';

type Placeholder = { src: string; caption: string };

// ── Foto a colori ──────────────────────────────────────────────────────────────
const COLOR: Placeholder[] = [
  {
    src: '/placeholder/ph-1.webp',
    caption: `Foto di <a href="https://unsplash.com/@steve_j?${UTM}">Steve Johnson</a> su <a href="https://unsplash.com/?${UTM}">Unsplash</a>`,
  },
  {
    src: '/placeholder/ph-2.webp',
    caption: `Foto di <a href="https://unsplash.com/@steve_j?${UTM}">Steve Johnson</a> su <a href="https://unsplash.com/?${UTM}">Unsplash</a>`,
  },
  {
    src: '/placeholder/ph-3.webp',
    caption: `Foto di <a href="https://unsplash.com/@steve_j?${UTM}">Steve Johnson</a> su <a href="https://unsplash.com/?${UTM}">Unsplash</a>`,
  },
  {
    src: '/placeholder/ph-4.webp',
    caption: `Foto di <a href="https://unsplash.com/@vackground?${UTM}">vackground.com</a> su <a href="https://unsplash.com/?${UTM}">Unsplash</a>`,
  },
  {
    src: '/placeholder/dennis-van-lith-rD1_nrA5_1U-unsplash.webp',
    caption: `Foto di <a href="https://unsplash.com/@dennis-van-lith?${UTM}">Dennis van Lith</a> su <a href="https://unsplash.com/photos/rD1_nrA5_1U?${UTM}">Unsplash</a>`,
  },
  {
    src: '/placeholder/jr-korpa-WKK4yIc3JBM-unsplash.webp',
    caption: `Foto di <a href="https://unsplash.com/@jr-korpa?${UTM}">Jr Korpa</a> su <a href="https://unsplash.com/photos/WKK4yIc3JBM?${UTM}">Unsplash</a>`,
  },
  {
    src: '/placeholder/martin-martz-W0EaIFjAck4-unsplash.webp',
    caption: `Foto di <a href="https://unsplash.com/@martin-martz?${UTM}">Martin Martz</a> su <a href="https://unsplash.com/photos/W0EaIFjAck4?${UTM}">Unsplash</a>`,
  },
  {
    src: '/placeholder/niko-n-_FJNAM5B0p0-unsplash.webp',
    caption: `Foto di <a href="https://unsplash.com/@niko-n?${UTM}">Niko N.</a> su <a href="https://unsplash.com/photos/_FJNAM5B0p0?${UTM}">Unsplash</a>`,
  },
  {
    src: '/placeholder/caio-brigagao-lunardi-_Ye1pm9fGZ4-unsplash.webp',
    caption: `Foto di <a href="https://unsplash.com/@caio-brigagao-lunardi?${UTM}">Caio Brigagão Lunardi</a> su <a href="https://unsplash.com/photos/_Ye1pm9fGZ4?${UTM}">Unsplash</a>`,
  },
  {
    src: '/placeholder/james-trenda-bZFkDfESCR8-unsplash.webp',
    caption: `Foto di <a href="https://unsplash.com/@james-trenda?${UTM}">James Trenda</a> su <a href="https://unsplash.com/photos/bZFkDfESCR8?${UTM}">Unsplash</a>`,
  },
  {
    src: '/placeholder/jr-korpa-GQeSfSWmXvI-unsplash.webp',
    caption: `Foto di <a href="https://unsplash.com/@jr-korpa?${UTM}">Jr Korpa</a> su <a href="https://unsplash.com/photos/GQeSfSWmXvI?${UTM}">Unsplash</a>`,
  },
  {
    src: '/placeholder/jr-korpa-PY6OnoitYfY-unsplash.webp',
    caption: `Foto di <a href="https://unsplash.com/@jr-korpa?${UTM}">Jr Korpa</a> su <a href="https://unsplash.com/photos/PY6OnoitYfY?${UTM}">Unsplash</a>`,
  },
  {
    src: '/placeholder/kate-trysh-s0yXRDMr6bY-unsplash.webp',
    caption: `Foto di <a href="https://unsplash.com/@kate-trysh?${UTM}">Kate Trysh</a> su <a href="https://unsplash.com/photos/s0yXRDMr6bY?${UTM}">Unsplash</a>`,
  },
  {
    src: '/placeholder/thomas-lindner-6GmAvTz-QwY-unsplash.webp',
    caption: `Foto di <a href="https://unsplash.com/@thomas-lindner?${UTM}">Thomas Lindner</a> su <a href="https://unsplash.com/photos/6GmAvTz-QwY?${UTM}">Unsplash</a>`,
  },
];

// ── Foto in bianco e nero (articoli ante-1998 senza immagine) ──────────────────
// Solo foto con prefisso ph-bw-: scelte manualmente, garantite B&N.
const BW: Placeholder[] = [
  {
    src: '/placeholder/ph-bw-fia-yang-5ye2nOdHDqM-unsplash.webp',
    caption: `Foto di <a href="https://unsplash.com/@fia-yang?${UTM}">Fia Yang</a> su <a href="https://unsplash.com/photos/5ye2nOdHDqM?${UTM}">Unsplash</a>`,
  },
  {
    src: '/placeholder/ph-bw-fia-yang-ENrCGBOFcnw-unsplash.webp',
    caption: `Foto di <a href="https://unsplash.com/@fia-yang?${UTM}">Fia Yang</a> su <a href="https://unsplash.com/photos/ENrCGBOFcnw?${UTM}">Unsplash</a>`,
  },
  {
    src: '/placeholder/ph-bw-everett-beaupit-A0nyxh7w6O8-unsplash.webp',
    caption: `Foto di <a href="https://unsplash.com/@everett-beaupit?${UTM}">Everett Beaupit</a> su <a href="https://unsplash.com/photos/A0nyxh7w6O8?${UTM}">Unsplash</a>`,
  },
  {
    src: '/placeholder/ph-bw-hilda-rytteke-tSWxeJx-C3E-unsplash.webp',
    caption: `Foto di <a href="https://unsplash.com/@hilda-rytteke?${UTM}">Hilda Rytteke</a> su <a href="https://unsplash.com/photos/tSWxeJx-C3E?${UTM}">Unsplash</a>`,
  },
  {
    src: '/placeholder/ph-bw-jan-huber-3D_Ks04MYdI-unsplash.webp',
    caption: `Foto di <a href="https://unsplash.com/@jan-huber?${UTM}">Jan Huber</a> su <a href="https://unsplash.com/photos/3D_Ks04MYdI?${UTM}">Unsplash</a>`,
  },
  {
    src: '/placeholder/ph-bw-kseniya-lapteva-xw8dKzrjXbk-unsplash.webp',
    caption: `Foto di <a href="https://unsplash.com/@kseniya-lapteva?${UTM}">Kseniya Lapteva</a> su <a href="https://unsplash.com/photos/xw8dKzrjXbk?${UTM}">Unsplash</a>`,
  },
  {
    src: '/placeholder/ph-bw-mahdi-bafande-CYsMPZ2yjlw-unsplash.webp',
    caption: `Foto di <a href="https://unsplash.com/@mahdi-bafande?${UTM}">Mahdi Bafande</a> su <a href="https://unsplash.com/photos/CYsMPZ2yjlw?${UTM}">Unsplash</a>`,
  },
  {
    src: '/placeholder/ph-bw-xander-ashwell-bhTjAUHHvSg-unsplash.webp',
    caption: `Foto di <a href="https://unsplash.com/@xander-ashwell?${UTM}">Xander Ashwell</a> su <a href="https://unsplash.com/photos/bhTjAUHHvSg?${UTM}">Unsplash</a>`,
  },
];

function pick(pool: Placeholder[], slug: string): Placeholder {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return pool[hash % pool.length];
}

export function getPlaceholder(slug: string, bw = false): Placeholder {
  return pick(bw ? BW : COLOR, slug);
}
