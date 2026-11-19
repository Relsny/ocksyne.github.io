// Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.
const fs = require('node:fs');
const path = require('node:path');
const { pixelsMatch, signature, matches } = require('../guard/compare');
const { shouldLog } = require('../guard/enforce');
const { findImagesDir } = require('../guard/images');
const { readText } = require('../guard/ocr');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const same = Buffer.from([1, 2, 3, 4, 5, 6]);
const other = Buffer.from([1, 200, 3, 4, 250, 6]);
assert(pixelsMatch(same, same), 'image identique');
assert(!pixelsMatch(same, other), 'image différente');

const dir = findImagesDir();
const sample = fs.readdirSync(dir).find((name) => /\.(png|jpe?g|webp)$/i.test(name));
assert(sample, 'aucune image de référence');
const bytes = fs.readFileSync(path.join(dir, sample));
signature(bytes).then(async (sign) => {
  assert(matches(sign, [{ ...sign, name: sample }]), 'la référence se reconnaît elle-même');
  const blank = Buffer.alloc(64, 7);
  const clean = await signature(blank);
  assert(!matches(clean, [{ sha256: 'autre', pixels: sign.pixels }]), 'image propre ignorée');
  const previous = process.env.LOG_CHANNEL_ID;
  delete process.env.LOG_CHANNEL_ID;
  assert(shouldLog() === false, 'sans salon de logs, aucun envoi');
  process.env.LOG_CHANNEL_ID = '123';
  assert(shouldLog() === true, 'salon de logs pris en compte');
  if (previous === undefined) delete process.env.LOG_CHANNEL_ID;
  else process.env.LOG_CHANNEL_ID = previous;
  const text = await readText(Buffer.from('pas une image'));
  assert(typeof text === 'string', 'OCR ne doit pas planter');
  console.log('AVATARS SELFTEST OK');
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
