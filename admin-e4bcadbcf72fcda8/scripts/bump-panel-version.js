// Met à jour le ?v= du panneau admin.
// À lancer avant chaque commit qui touche manifest.json ou un fichier du bot.
//
//   node scripts/bump-panel-version.js
//
// La version est le SHA-256 (12 caractères) de manifest.json,
// de chaque fichier listé dedans, puis de packaging.js et panel.js.
// Le script réécrit les ?v= de index.html. Il n’écrit rien d’autre,
// donc le relancer sans changer le bot redonne la même version.
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const adminDir = path.join(__dirname, '..');
const manifestPath = path.join(adminDir, 'manifest.json');
const indexPath = path.join(adminDir, 'index.html');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const files = [...manifest.base];
for (const list of Object.values(manifest.modules || {})) files.push(...list);
files.sort();

const hash = crypto.createHash('sha256');
hash.update(fs.readFileSync(manifestPath));
hash.update('\0');
for (const rel of files) {
  const abs = path.join(adminDir, 'bot', rel);
  hash.update(rel);
  hash.update('\0');
  hash.update(fs.readFileSync(abs));
  hash.update('\0');
}
for (const rel of ['packaging.js', 'panel.js']) {
  hash.update(rel);
  hash.update('\0');
  hash.update(fs.readFileSync(path.join(adminDir, rel)));
  hash.update('\0');
}
const version = hash.digest('hex').slice(0, 12);

const html = fs.readFileSync(indexPath, 'utf8');
if (!/\?v=[A-Za-z0-9._-]+/.test(html)) {
  throw new Error('index.html ne contient aucun ?v=');
}
const next = html.replace(/\?v=[A-Za-z0-9._-]+/g, `?v=${version}`);
fs.writeFileSync(indexPath, next);
console.log(version);
