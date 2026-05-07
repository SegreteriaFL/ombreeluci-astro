/**
 * Converti tutte le immagini in public/placeholder/ in WebP <150KB.
 * Usa sharp. Sovrascrive i .webp esistenti, NON tocca i .jpg originali.
 *
 * Usage: node scripts/optimize-placeholders.mjs
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLACEHOLDER_DIR = path.resolve(__dirname, '../public/placeholder');
const TARGET_KB = 150;
const TARGET_BYTES = TARGET_KB * 1024;
const MAX_WIDTH = 1600;

const files = fs.readdirSync(PLACEHOLDER_DIR).filter(f =>
  /\.(jpg|jpeg|png|webp)$/i.test(f)
);

for (const file of files) {
  const inputPath = path.join(PLACEHOLDER_DIR, file);
  const baseName = path.basename(file, path.extname(file));
  const outputPath = path.join(PLACEHOLDER_DIR, `${baseName}.webp`);

  // Skip se è già un webp ottimizzato (stessa dimensione target)
  if (file.endsWith('.webp') && fs.existsSync(outputPath)) {
    const size = fs.statSync(outputPath).size;
    if (size <= TARGET_BYTES) {
      console.log(`  ✅ ${file} — già ottimizzato (${Math.round(size / 1024)}KB)`);
      continue;
    }
  }

  // Leggi metadati per determinare orientamento
  const meta = await sharp(inputPath).metadata();
  const width = Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH);

  // Prima passata: quality 80
  let quality = 80;
  let outputBuffer = await sharp(inputPath)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  // Abbassa quality finché <150KB (minimo 40)
  while (outputBuffer.length > TARGET_BYTES && quality > 40) {
    quality -= 10;
    outputBuffer = await sharp(inputPath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
  }

  // Se ancora troppo grande, riduci dimensione
  let resizeWidth = width;
  while (outputBuffer.length > TARGET_BYTES && resizeWidth > 400) {
    resizeWidth = Math.round(resizeWidth * 0.8);
    outputBuffer = await sharp(inputPath)
      .resize({ width: resizeWidth, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
  }

  fs.writeFileSync(outputPath, outputBuffer);
  const originalKB = Math.round(fs.statSync(inputPath).size / 1024);
  const outputKB = Math.round(outputBuffer.length / 1024);
  console.log(`  ✅ ${file} → ${baseName}.webp  ${originalKB}KB → ${outputKB}KB (quality=${quality}, width=${resizeWidth}px)`);
}

console.log('\nDone. Aggiorna src/utils/placeholder.ts con i nuovi filename .webp se necessario.');
